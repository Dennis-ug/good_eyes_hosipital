#!/bin/bash

echo "Testing simple patient visit session creation (without automatic invoice)..."

# Test data for visit session creation
TEST_VISIT_SESSION='{
  "patientId": 1,
  "visitPurpose": "FOLLOW_UP",
  "chiefComplaint": "Follow-up appointment",
  "requiresTriage": false,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeePaid": false,
  "consultationFeeAmount": null,
  "paymentMethod": null,
  "paymentReference": null,
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "notes": "Regular follow-up appointment",
  "currentStage": "RECEPTION"
}'

echo "Creating test visit session..."
curl -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$TEST_VISIT_SESSION"

if [ $? -eq 0 ]; then
    echo "✅ Visit session creation successful!"
else
    echo "❌ Visit session creation failed. Check the error message above."
fi 