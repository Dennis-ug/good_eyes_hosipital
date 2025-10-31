#!/bin/bash

echo "Testing updated Invoice APIs with user-based approach..."

# Test data for invoice creation
TEST_INVOICE='{
  "patientId": 1,
  "invoiceItems": [
    {
      "itemName": "Consultation Fee",
      "itemDescription": "Medical consultation",
      "itemType": "CONSULTATION",
      "quantity": 1,
      "unitPrice": 50.00,
      "taxPercentage": 18.00,
      "insuranceCovered": false
    }
  ],
  "notes": "Test invoice created via API",
  "dueDate": "2025-08-15"
}'

echo "Creating test invoice..."
INVOICE_RESPONSE=$(curl -s -X POST http://localhost:5025/api/finance/invoices/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$TEST_INVOICE")

INVOICE_ID=$(echo "$INVOICE_RESPONSE" | jq -r '.id')

if [ -n "$INVOICE_ID" ] && [ "$INVOICE_ID" != "null" ]; then
    echo "✅ Invoice created successfully with ID: $INVOICE_ID"
    
    echo "Testing invoice retrieval by ID..."
    GET_RESPONSE=$(curl -s -X GET "http://localhost:5025/api/finance/invoices/$INVOICE_ID" \
      -H "Authorization: Bearer <your-token-here>")
    
    if echo "$GET_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        echo "✅ Invoice retrieval successful"
        echo "Invoice details:"
        echo "$GET_RESPONSE" | jq '.'
    else
        echo "❌ Invoice retrieval failed"
    fi
    
    echo "Testing invoice listing..."
    LIST_RESPONSE=$(curl -s -X GET "http://localhost:5025/api/finance/invoices?page=0&size=5" \
      -H "Authorization: Bearer <your-token-here>")
    
    if echo "$LIST_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
        echo "✅ Invoice listing successful"
        TOTAL_INVOICES=$(echo "$LIST_RESPONSE" | jq -r '.totalElements')
        echo "Total invoices: $TOTAL_INVOICES"
    else
        echo "❌ Invoice listing failed"
    fi
    
    echo "Testing invoice by user (if user exists)..."
    USER_RESPONSE=$(curl -s -X GET "http://localhost:5025/api/finance/invoices/user/1?page=0&size=5" \
      -H "Authorization: Bearer <your-token-here>")
    
    if echo "$USER_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
        echo "✅ Invoice by user successful"
        USER_INVOICES=$(echo "$USER_RESPONSE" | jq -r '.totalElements')
        echo "Invoices for user: $USER_INVOICES"
    else
        echo "⚠️  Invoice by user failed (may be expected if no user exists)"
    fi
    
else
    echo "❌ Invoice creation failed"
    echo "Response: $INVOICE_RESPONSE"
fi

echo "✅ Invoice API tests completed!" 