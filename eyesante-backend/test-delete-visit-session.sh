#!/bin/bash
echo "Testing delete visit session endpoint..."

# First, create a visit session to delete
echo "Creating a visit session to delete..."
VISIT_SESSION='{
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Test visit for deletion",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.00,
  "paymentMethod": null,
  "paymentReference": null,
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "notes": "Test visit",
  "currentStage": "RECEPTION"
}'

VISIT_RESPONSE=$(curl -s -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$VISIT_SESSION")

VISIT_ID=$(echo "$VISIT_RESPONSE" | jq -r '.id')
if [ -n "$VISIT_ID" ] && [ "$VISIT_ID" != "null" ]; then
    echo "✅ Visit session created with ID: $VISIT_ID"
    
    # Now delete the visit session
    echo "Deleting visit session ID: $VISIT_ID..."
    DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:5025/api/patient-visit-sessions/$VISIT_ID" \
      -H "Authorization: Bearer <your-token-here>")
    
    if echo "$DELETE_RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
        echo "✅ Delete successful!"
        echo "Response: $DELETE_RESPONSE"
        
        # Verify the visit session is deleted by trying to get it
        echo "Verifying deletion..."
        GET_RESPONSE=$(curl -s -X GET "http://localhost:5025/api/patient-visit-sessions/$VISIT_ID" \
          -H "Authorization: Bearer <your-token-here>")
        
        if echo "$GET_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
            echo "✅ Confirmed: Visit session is deleted (404 response)"
        else
            echo "⚠️  Warning: Visit session might still exist"
            echo "GET Response: $GET_RESPONSE"
        fi
    else
        echo "❌ Delete failed"
        echo "Response: $DELETE_RESPONSE"
    fi
else
    echo "❌ Failed to create visit session for deletion test"
    echo "Response: $VISIT_RESPONSE"
fi

echo "✅ Delete visit session test completed!"
