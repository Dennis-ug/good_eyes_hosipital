#!/bin/bash

# Eyesante Inventory-Invoice Integration Test Script
BASE_URL="http://localhost:5025"
ACCESS_TOKEN=""

echo "🔍 Eyesante Inventory-Invoice Integration Test Script"
echo "===================================================="

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "📋 Testing: $description"
    echo "🔗 $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        echo "📦 Request Data: $data"
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -X "$method" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    echo "📊 Status Code: $http_code"
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ Success"
        echo "📄 Response: $response_body" | jq '.' 2>/dev/null || echo "📄 Response: $response_body"
    else
        echo "❌ Failed"
        echo "📄 Error Response: $response_body"
    fi
    echo "----------------------------------------"
}

# Login to get access token
echo "🔐 Logging in to get access token..."
login_response=$(curl -s -H "Content-Type: application/json" \
    -d '{"username": "superadmin", "password": "superadmin123"}' \
    "$BASE_URL/api/auth/login")

ACCESS_TOKEN=$(echo "$login_response" | jq -r '.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Login failed. Please check credentials."
    echo "Response: $login_response"
    exit 1
fi

echo "✅ Login successful. Access token obtained."

# Test Inventory-Invoice Integration
echo ""
echo "📋 INVENTORY-INVOICE INTEGRATION TESTS"
echo "======================================"

# Get available inventory items for invoicing
make_request "GET" "/api/inventory/items/available-for-invoice" "" "Get Available Items for Invoice"

# Create invoice with inventory items
create_invoice_with_inventory_data='{
  "patientId": 1,
  
  "invoiceDate": "2025-01-27",
  "dueDate": "2025-02-26",
  "taxAmount": 0.00,
  "discountAmount": 0.00,
  "notes": "Invoice created with inventory items",
  "internalNotes": "Test invoice with inventory integration",
  "insuranceProvider": "Test Insurance",
  "insuranceNumber": "INS123456",
  "insuranceCoverage": 80.00,
  "invoiceItems": [
    {
      "itemName": "Eye Drops - Artificial Tears",
      "itemDescription": "Lubricating eye drops for dry eyes",
      "itemType": "INVENTORY_ITEM",
      "quantity": 2,
      "unitPrice": 15.99,
      "discountPercentage": 0.00,
      "taxPercentage": 0.00,
      "insuranceCovered": false,
      "insuranceCoveragePercentage": 0.00,
      "notes": "Inventory item from stock",
      "inventoryItemId": 1,
      "sku": "ED-AT-001"
    }
  ]
}'

make_request "POST" "/api/finance/invoices/create" "$create_invoice_with_inventory_data" "Create Invoice with Inventory Items"

# Check updated inventory stock
echo ""
echo "📋 Checking updated inventory stock..."
make_request "GET" "/api/inventory/items/1" "" "Check Updated Stock for Item 1"

echo ""
echo "🎉 Inventory-Invoice Integration testing completed!"
