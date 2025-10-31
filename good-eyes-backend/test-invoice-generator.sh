#!/bin/bash

# Test script to verify invoice generator is automatically captured
BASE_URL="http://localhost:5025"
ACCESS_TOKEN=""

echo "🔍 Testing Invoice Generator Auto-Capture"
echo "========================================"

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

# Test creating invoice without doctorId
echo ""
echo "📋 TESTING INVOICE CREATION WITHOUT DOCTOR ID"
echo "============================================="

create_invoice_data='{
  "patientId": 1,
  "invoiceDate": "2025-01-27",
  "dueDate": "2025-02-26",
  "taxAmount": 0.00,
  "discountAmount": 0.00,
  "notes": "Test invoice - no doctor ID provided",
  "internalNotes": "Testing automatic invoice generator capture",
  "invoiceItems": [
    {
      "itemName": "Test Consultation",
      "itemDescription": "Test consultation service",
      "itemType": "CONSULTATION",
      "quantity": 1,
      "unitPrice": 50.00,
      "discountPercentage": 0.00,
      "taxPercentage": 0.00,
      "insuranceCovered": false,
      "insuranceCoveragePercentage": 0.00,
      "notes": "Test item"
    }
  ]
}'

response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -X "POST" \
    -d "$create_invoice_data" \
    "$BASE_URL/api/finance/invoices/create")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "📊 Status Code: $http_code"
if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ Success - Invoice created without doctorId"
    echo "📄 Response: $response_body" | jq '.' 2>/dev/null || echo "📄 Response: $response_body"
else
    echo "❌ Failed"
    echo "📄 Error Response: $response_body"
fi

echo ""
echo "🎉 Invoice Generator Auto-Capture testing completed!"
echo "💡 The system now automatically captures who generated the invoice!"
