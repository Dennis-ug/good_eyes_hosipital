#!/bin/bash
echo "Testing invoice payment with visit session update..."

# First, create a consultation visit session
echo "Creating consultation visit session..."
VISIT_SESSION='{
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.00,
  "paymentMethod": null,
  "paymentReference": null,
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "notes": "Patient complaining of eye pain",
  "currentStage": "RECEPTION"
}'

VISIT_RESPONSE=$(curl -s -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$VISIT_SESSION")

VISIT_ID=$(echo "$VISIT_RESPONSE" | jq -r '.id')
if [ -n "$VISIT_ID" ] && [ "$VISIT_ID" != "null" ]; then
    echo "✅ Visit session created with ID: $VISIT_ID"
    
    # Get the visit session to check initial status
    echo "Checking initial visit session status..."
    INITIAL_STATUS=$(curl -s -X GET "http://localhost:5025/api/patient-visit-sessions/$VISIT_ID" \
      -H "Authorization: Bearer <your-token-here>" | jq -r '.currentStage')
    echo "Initial stage: $INITIAL_STATUS"
    
    # Get the invoice ID from the visit session
    INVOICE_ID=$(curl -s -X GET "http://localhost:5025/api/patient-visit-sessions/$VISIT_ID" \
      -H "Authorization: Bearer <your-token-here>" | jq -r '.invoice.id')
    
    if [ -n "$INVOICE_ID" ] && [ "$INVOICE_ID" != "null" ]; then
        echo "✅ Invoice found with ID: $INVOICE_ID"
        
        # Record payment for the invoice
        echo "Recording payment for invoice..."
        PAYMENT_RESPONSE=$(curl -s -X POST "http://localhost:5025/api/finance/invoices/$INVOICE_ID/payment?amount=50.00&method=CASH&reference=TEST_PAYMENT" \
          -H "Authorization: Bearer <your-token-here>")
        
        if echo "$PAYMENT_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
            echo "✅ Payment recorded successfully"
            
            # Check the updated visit session status
            echo "Checking updated visit session status..."
            sleep 2  # Give some time for the update to complete
            
            UPDATED_STATUS=$(curl -s -X GET "http://localhost:5025/api/patient-visit-sessions/$VISIT_ID" \
              -H "Authorization: Bearer <your-token-here>" | jq -r '.currentStage')
            CONSULTATION_PAID=$(curl -s -X GET "http://localhost:5025/api/patient-visit-sessions/$VISIT_ID" \
              -H "Authorization: Bearer <your-token-here>" | jq -r '.consultationFeePaid')
            
            echo "Updated stage: $UPDATED_STATUS"
            echo "Consultation fee paid: $CONSULTATION_PAID"
            
            if [ "$UPDATED_STATUS" = "TRIAGE" ] && [ "$CONSULTATION_PAID" = "true" ]; then
                echo "✅ SUCCESS: Visit session updated correctly!"
                echo "   - Stage progressed from $INITIAL_STATUS to $UPDATED_STATUS"
                echo "   - Consultation fee marked as paid: $CONSULTATION_PAID"
            else
                echo "❌ FAILED: Visit session not updated correctly"
                echo "   - Expected stage: TRIAGE, Got: $UPDATED_STATUS"
                echo "   - Expected consultation fee paid: true, Got: $CONSULTATION_PAID"
            fi
        else
            echo "❌ Payment recording failed"
            echo "Response: $PAYMENT_RESPONSE"
        fi
    else
        echo "❌ No invoice found for visit session"
    fi
else
    echo "❌ Visit session creation failed"
    echo "Response: $VISIT_RESPONSE"
fi

echo "✅ Invoice payment with visit session update test completed!"
