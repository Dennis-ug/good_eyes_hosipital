#!/bin/bash

# Test script to verify inventory validation fixes
BASE_URL="http://localhost:5025"
ACCESS_TOKEN=""

echo "🔍 Testing Inventory Validation Fixes"
echo "===================================="

# Login to get access token
echo "🔐 Logging in to get access token..."
login_response=$(curl -s -H "Content-Type: application/json" \
    -d '{"username": "superadmin", "password": "superadmin123"}' \
    "$BASE_URL/api/auth/login")

ACCESS_TOKEN=$(echo "$login_response" | jq -r '.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Login failed. Please check credentials."
    exit 1
fi

echo "✅ Login successful. Access token obtained."

# Test: Create inventory item with 0 quantity (should work now)
echo ""
echo "📋 TEST: Create inventory item with 0 quantity"
echo "================================================"

create_item_zero_stock='{
  "name": "Test Item - Zero Stock",
  "description": "Test item with zero initial stock",
  "sku": "TEST-ZERO-001",
  "unitPrice": 25.99,
  "costPrice": 15.50,
  "quantityInStock": 0,
  "minimumStockLevel": 0,
  "maximumStockLevel": 100,
  "unitOfMeasure": "units",
  "categoryId": 1,
  "supplierName": "Test Supplier",
  "supplierContact": "test@supplier.com",
  "reorderPoint": 0,
  "reorderQuantity": 10
}'

response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -X "POST" \
    -d "$create_item_zero_stock" \
    "$BASE_URL/api/inventory/items")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "📊 Status Code: $http_code"
if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ Success - Item created with 0 stock"
    echo "📄 Response: $response_body" | jq '.' 2>/dev/null || echo "📄 Response: $response_body"
else
    echo "❌ Failed"
    echo "📄 Error Response: $response_body"
fi

echo ""
echo "🎉 Inventory validation testing completed!"
echo "💡 The validation fixes should now allow zero values!"
