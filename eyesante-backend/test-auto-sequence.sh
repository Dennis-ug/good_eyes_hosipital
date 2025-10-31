#!/bin/bash

echo "Testing Automatic Sequence Creation..."

# Start the application (it will automatically create the sequence)
echo "Starting application to auto-create sequence..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &
APP_PID=$!

# Wait for application to start
echo "Waiting for application to start..."
sleep 60

# Test creating a patient
echo "Creating a test patient..."
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -d '{
    "firstName": "Auto",
    "lastName": "Sequence",
    "gender": "Male",
    "nationalId": "AUTO123456789",
    "dateOfBirth": "1990-01-01",
    "ageInYears": 30,
    "phone": "1234567890",
    "residence": "Test City"
  }' | jq '.'

echo -e "\n\nVerifying patient was created with number..."
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  | jq '.content[] | {id, patientNumber, firstName, lastName}'

# Stop the application
echo -e "\n\nStopping application..."
kill $APP_PID

echo -e "\n\nAutomatic sequence creation test completed!" 