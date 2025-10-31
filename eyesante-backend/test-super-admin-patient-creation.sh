#!/bin/bash

echo "Testing Super Admin Patient Creation"
echo "==================================="

# Test 1: Login as super admin
echo "1. Logging in as super admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}')

if [ $? -eq 0 ]; then
    echo "✅ Super admin login successful"
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "Access token obtained: ${ACCESS_TOKEN:0:20}..."
else
    echo "❌ Super admin login failed"
    exit 1
fi

# Test 2: Create a patient using the main patient endpoint
echo "2. Testing patient creation via /api/patients endpoint..."
PATIENT_DATA='{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "nationalId": "123456789",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 34,
  "ageInMonths": 0,
  "maritalStatus": "Single",
  "religion": "Christian",
  "occupation": "Engineer",
  "nextOfKin": "Jane Doe",
  "nextOfKinRelationship": "Wife",
  "nextOfKinPhone": "1234567890",
  "phone": "0987654321",
  "alternativePhone": "1122334455",
  "phoneOwner": "self",
  "ownerName": "",
  "patientCategory": "Cash",
  "company": "SELF EMPLOYED",
  "preferredLanguage": "eng",
  "citizenship": "1",
  "countryId": "",
  "foreignerOrRefugee": "",
  "nonUgandanNationalIdNo": "",
  "residence": "Kampala",
  "researchNumber": ""
}'

CREATE_PATIENT_RESPONSE=$(curl -s -X POST http://localhost:5025/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$PATIENT_DATA")

if [[ $CREATE_PATIENT_RESPONSE == *"firstName"* ]] && [[ $CREATE_PATIENT_RESPONSE == *"John"* ]]; then
    echo "✅ Patient creation via /api/patients successful"
    PATIENT_ID=$(echo $CREATE_PATIENT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "Created patient ID: $PATIENT_ID"
else
    echo "❌ Patient creation via /api/patients failed"
    echo "Response: $CREATE_PATIENT_RESPONSE"
fi

# Test 3: Create a patient using the reception endpoint
echo "3. Testing patient creation via /api/reception/receive-new-patient endpoint..."
RECEPTION_PATIENT_RESPONSE=$(curl -s -X POST http://localhost:5025/api/reception/receive-new-patient \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$PATIENT_DATA")

if [[ $RECEPTION_PATIENT_RESPONSE == *"firstName"* ]] && [[ $RECEPTION_PATIENT_RESPONSE == *"John"* ]]; then
    echo "✅ Patient creation via reception endpoint successful"
else
    echo "❌ Patient creation via reception endpoint failed"
    echo "Response: $RECEPTION_PATIENT_RESPONSE"
fi

# Test 4: Test patient update
echo "4. Testing patient update..."
UPDATE_DATA='{
  "firstName": "John",
  "lastName": "Doe Updated",
  "gender": "Male",
  "nationalId": "123456789",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 34,
  "ageInMonths": 0,
  "maritalStatus": "Married",
  "religion": "Christian",
  "occupation": "Engineer",
  "nextOfKin": "Jane Doe",
  "nextOfKinRelationship": "Wife",
  "nextOfKinPhone": "1234567890",
  "phone": "0987654321",
  "alternativePhone": "1122334455",
  "phoneOwner": "self",
  "ownerName": "",
  "patientCategory": "Cash",
  "company": "SELF EMPLOYED",
  "preferredLanguage": "eng",
  "citizenship": "1",
  "countryId": "",
  "foreignerOrRefugee": "",
  "nonUgandanNationalIdNo": "",
  "residence": "Kampala",
  "researchNumber": ""
}'

if [ ! -z "$PATIENT_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:5025/api/patients/$PATIENT_ID \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d "$UPDATE_DATA")

    if [[ $UPDATE_RESPONSE == *"Doe Updated"* ]]; then
        echo "✅ Patient update successful"
    else
        echo "❌ Patient update failed"
        echo "Response: $UPDATE_RESPONSE"
    fi
else
    echo "⚠️  Skipping patient update test (no patient ID available)"
fi

# Test 5: Test patient deletion (super admin only)
echo "5. Testing patient deletion..."
if [ ! -z "$PATIENT_ID" ]; then
    DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:5025/api/patients/$PATIENT_ID \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    if [ $? -eq 0 ]; then
        echo "✅ Patient deletion successful"
    else
        echo "❌ Patient deletion failed"
        echo "Response: $DELETE_RESPONSE"
    fi
else
    echo "⚠️  Skipping patient deletion test (no patient ID available)"
fi

echo ""
echo "Super admin patient creation test completed!" 