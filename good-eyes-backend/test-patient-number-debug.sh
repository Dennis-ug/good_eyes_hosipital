#!/bin/bash

echo "Testing Patient Number Generation with Debug Output..."

# Start the application
echo "Starting application..."
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
    "firstName": "Debug",
    "lastName": "Test",
    "gender": "Male",
    "nationalId": "DEBUG123456789",
    "dateOfBirth": "1990-01-01",
    "ageInYears": 30,
    "phone": "1234567890",
    "residence": "Test City"
  }' | jq '.'

echo -e "\n\nChecking the application logs for debug output..."
echo "Look for the debug messages in the application output above."

# Stop the application
echo -e "\n\nStopping application..."
kill $APP_PID

echo -e "\n\nDebug test completed!" 