#!/bin/bash

# Eyesante Finance API Test Script
BASE_URL="http://localhost:5025"
ACCESS_TOKEN=""

echo "🔍 Eyesante Finance API Test Script"
echo "=================================="

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

# Test Invoice Management APIs
echo ""
echo "📋 INVOICE MANAGEMENT TESTS"
echo "=========================="

make_request "GET" "/api/finance/invoices?page=0&size=5" "" "Get All Invoices"
make_request "GET" "/api/finance/invoices/1" "" "Get Invoice by ID"

# Test Invoice Creation APIs
echo ""
echo "📋 INVOICE CREATION TESTS"
echo "========================"

make_request "POST" "/api/finance/invoices/generate/1" "" "Generate Invoice for Appointment"

# Test Create Invoice with Patient and Items
create_invoice_data='{
  "patientId": 1,
  
  "appointmentId": 3,
  "invoiceDate": "2025-01-27",
  "dueDate": "2025-02-26",
  "taxAmount": 0.00,
  "discountAmount": 0.00,
  "notes": "Invoice created for patient consultation",
  "internalNotes": "Internal notes for accounting",
  "insuranceProvider": "Insurance Co",
  "insuranceNumber": "INS123456",
  "insuranceCoverage": 80.00,
  "invoiceItems": [
    {
      "itemName": "Eye Consultation",
      "itemDescription": "Comprehensive eye examination",
      "itemType": "CONSULTATION",
      "quantity": 1,
      "unitPrice": 50.00,
      "discountPercentage": 0.00,
      "taxPercentage": 0.00,
      "insuranceCovered": false,
      "insuranceCoveragePercentage": 0.00,
      "notes": "Standard consultation fee"
    },
    {
      "itemName": "Glasses Fitting",
      "itemDescription": "Professional glasses fitting service",
      "itemType": "PROCEDURE",
      "quantity": 1,
      "unitPrice": 25.00,
      "discountPercentage": 0.00,
      "taxPercentage": 0.00,
      "insuranceCovered": false,
      "insuranceCoveragePercentage": 0.00,
      "notes": "Glasses fitting service"
    }
  ]
}'

make_request "POST" "/api/finance/invoices/create" "$create_invoice_data" "Create Invoice with Patient and Items"

# Test Payment Management APIs
echo ""
echo "📋 PAYMENT MANAGEMENT TESTS"
echo "=========================="

make_request "POST" "/api/finance/invoices/1/payment?amount=50000&method=CASH&reference=PAY-001" "" "Record Payment"
make_request "PUT" "/api/finance/invoices/1/status?status=PAID" "" "Update Invoice Status"

# Test Financial Reports APIs
echo ""
echo "📋 FINANCIAL REPORTS TESTS"
echo "========================="

make_request "GET" "/api/finance/summary?startDate=2025-01-01&endDate=2025-01-31" "" "Get Financial Summary"

echo ""
echo "🎉 Finance API testing completed!"
echo "📊 Check the results above for any failed endpoints."
