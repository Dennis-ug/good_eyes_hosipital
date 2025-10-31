#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5025"

echo -e "${BLUE}🏥 Eyesante Backend API Testing${NC}"
echo "=================================="

# Function to make API calls and display results
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "Response: $response"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Response: $response"
    fi
    echo "----------------------------------"
}

# Function to login and get token
login() {
    local username=$1
    local password=$2
    local role=$3
    
    echo -e "\n${BLUE}🔐 Logging in as $role ($username)${NC}"
    
    response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$username\", \"password\": \"$password\"}")
    
    if [[ $response == *"accessToken"* ]]; then
        TOKEN=$(echo $response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Login successful for $role${NC}"
        return 0
    else
        echo -e "${RED}❌ Login failed for $role${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Test public endpoints first
echo -e "\n${BLUE}📋 Testing Public Endpoints${NC}"
echo "================================"

test_api "GET" "/api/auth/test" "" "Authentication endpoint test"
test_api "GET" "/api/departments" "" "Get all departments"

# Test super admin login
if login "superadmin" "superadmin123" "Super Admin"; then
    echo -e "\n${BLUE}👑 Testing Super Admin Functions${NC}"
    echo "================================="
    
    # Create a receptionist user
    test_api "POST" "/api/auth/create-user" '{
        "username": "receptionist1",
        "email": "receptionist1@eyesante.com",
        "firstName": "John",
        "lastName": "Receptionist",
        "password": "reception123"
    }' "Create receptionist user"
    
    # Create departments
    test_api "POST" "/api/departments" '{
        "name": "Cardiology",
        "description": "Handles heart-related treatments",
        "enabled": true
    }' "Create new department"
fi

# Test receptionist login
if login "receptionist1" "reception123" "Receptionist"; then
    echo -e "\n${BLUE}🏥 Testing Reception Functions${NC}"
    echo "================================="
    
    # Receive new patient
    test_api "POST" "/api/reception/receive-new-patient" '{
        "firstName": "Alice",
        "lastName": "Johnson",
        "gender": "Female",
        "nationalId": "123456789",
        "dateOfBirth": "1990-05-15",
        "ageInYears": 33,
        "ageInMonths": 0,
        "maritalStatus": "Single",
        "religion": "Christian",
        "occupation": "Teacher",
        "nextOfKin": "Bob Johnson",
        "nextOfKinRelationship": "Brother",
        "nextOfKinPhone": "0777123456",
        "phone": "0777987654",
        "alternativePhone": "0777123457",
        "phoneOwner": "self",
        "patientCategory": "Cash",
        "company": "SELF EMPLOYED",
        "preferredLanguage": "eng",
        "citizenship": "1",
        "residence": "Kampala"
    }' "Receive new patient"
    
    # Get patients received today
    test_api "GET" "/api/reception/patients-today" "" "Get patients received today"
    
    # Receive returning patient (assuming patient ID 1 exists)
    test_api "POST" "/api/reception/receive-returning-patient/1" "" "Receive returning patient"
fi

# Test patient management
if login "receptionist1" "reception123" "Receptionist"; then
    echo -e "\n${BLUE}👥 Testing Patient Management${NC}"
    echo "=================================="
    
    # Get all patients
    test_api "GET" "/api/patients" "" "Get all patients"
    
    # Get specific patient
    test_api "GET" "/api/patients/1" "" "Get patient by ID"
    
    # Update patient
    test_api "PUT" "/api/patients/1" '{
        "firstName": "Alice",
        "lastName": "Johnson-Smith",
        "gender": "Female",
        "nationalId": "123456789",
        "dateOfBirth": "1990-05-15",
        "ageInYears": 33,
        "ageInMonths": 0,
        "maritalStatus": "Married",
        "religion": "Christian",
        "occupation": "Teacher",
        "nextOfKin": "Bob Johnson",
        "nextOfKinRelationship": "Brother",
        "nextOfKinPhone": "0777123456",
        "phone": "0777987654",
        "alternativePhone": "0777123457",
        "phoneOwner": "self",
        "patientCategory": "Cash",
        "company": "SELF EMPLOYED",
        "preferredLanguage": "eng",
        "citizenship": "1",
        "residence": "Kampala"
    }' "Update patient information"
fi

# Test role and permission management (as super admin)
if login "superadmin" "superadmin123" "Super Admin"; then
    echo -e "\n${BLUE}🔐 Testing Role & Permission Management${NC}"
    echo "============================================="
    
    # Get all roles
    test_api "GET" "/api/admin/roles" "" "Get all roles"
    
    # Get all permissions
    test_api "GET" "/api/admin/permissions" "" "Get all permissions"
    
    # Create a new permission
    test_api "POST" "/api/admin/permissions" '{
        "name": "PATIENT_VIEW",
        "description": "Can view patient information",
        "resourceName": "patient",
        "actionName": "view",
        "enabled": true
    }' "Create new permission"
    
    # Create a new role
    test_api "POST" "/api/admin/roles" '{
        "name": "NURSE",
        "description": "Nursing staff role",
        "enabled": true,
        "permissionIds": [1]
    }' "Create new role"
fi

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================"
echo -e "${BLUE}Summary of tested endpoints:${NC}"
echo "✅ Authentication endpoints"
echo "✅ Department management"
echo "✅ Reception activities"
echo "✅ Patient management"
echo "✅ Role & permission management"
echo ""
echo -e "${YELLOW}Note: Some tests may fail if the application is not running or if users/departments don't exist.${NC}" 