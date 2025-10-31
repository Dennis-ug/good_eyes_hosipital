#!/bin/bash

echo "Testing Current Application State..."

# Check if application is running
echo "Checking if application is running..."
curl -s http://localhost:8080/actuator/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Application is running"
else
    echo "❌ Application is not running"
    exit 1
fi

echo -e "\n\nChecking current patients..."
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  | jq '.content[] | {id, patientNumber, firstName, lastName}' 2>/dev/null

echo -e "\n\nCurrent state test completed!" 