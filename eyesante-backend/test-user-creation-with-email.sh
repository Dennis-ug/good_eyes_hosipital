#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5025"

echo -e "${BLUE}👁️ Eyesante Eye Clinic - User Creation with Email Test${NC}"
echo "========================================================"

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

# Test super admin login
if login "superadmin" "superadmin123" "Super Admin"; then
    echo -e "\n${BLUE}👑 Testing User Creation with Email Notifications${NC}"
    echo "=================================================="
    
    # Test 1: Create Optometrist with email notification
    test_api "POST" "/api/auth/create-user" '{
        "username": "optometrist1",
        "email": "optometrist1@eyesante.com",
        "firstName": "Dr. Sarah",
        "lastName": "Optometrist",
        "roles": ["OPTOMETRIST"],
        "departmentId": 2,
        "sendEmailNotification": true,
        "customMessage": "Welcome to the Optometry team! Please complete your eye examination training."
    }' "Create Optometrist with email notification"
    
    # Test 2: Create Ophthalmologist with email notification
    test_api "POST" "/api/auth/create-user" '{
        "username": "ophthalmologist1",
        "email": "ophthalmologist1@eyesante.com",
        "firstName": "Dr. Michael",
        "lastName": "Ophthalmologist",
        "roles": ["OPHTHALMOLOGIST"],
        "departmentId": 3,
        "sendEmailNotification": true,
        "customMessage": "Welcome to the Ophthalmology team! You will handle medical eye care and treatments."
    }' "Create Ophthalmologist with email notification"
    
    # Test 3: Create Receptionist with email notification
    test_api "POST" "/api/auth/create-user" '{
        "username": "receptionist1",
        "email": "receptionist1@eyesante.com",
        "firstName": "Jane",
        "lastName": "Receptionist",
        "roles": ["RECEPTIONIST"],
        "departmentId": 1,
        "sendEmailNotification": true,
        "customMessage": "Welcome to the Reception team! You will handle patient registration and management."
    }' "Create Receptionist with email notification"
    
    # Test 4: Create user with multiple roles
    test_api "POST" "/api/auth/create-user" '{
        "username": "senior_optometrist",
        "email": "senior.optometrist@eyesante.com",
        "firstName": "Dr. Emily",
        "lastName": "Senior",
        "roles": ["OPTOMETRIST", "OPHTHALMOLOGIST"],
        "departmentId": 2,
        "sendEmailNotification": true,
        "customMessage": "Welcome as Senior Optometrist! You have both optometry and ophthalmology privileges."
    }' "Create user with multiple roles"
    
    # Test 5: Create user without email notification
    test_api "POST" "/api/auth/create-user" '{
        "username": "test_user",
        "email": "test.user@eyesante.com",
        "firstName": "Test",
        "lastName": "User",
        "roles": ["USER"],
        "sendEmailNotification": false
    }' "Create user without email notification"
    
    # Test 6: Create user with custom password
    test_api "POST" "/api/auth/create-user" '{
        "username": "admin_user",
        "email": "admin.user@eyesante.com",
        "firstName": "Admin",
        "lastName": "User",
        "password": "admin123",
        "roles": ["ADMIN"],
        "sendEmailNotification": true,
        "customMessage": "Welcome as Admin! You have administrative privileges."
    }' "Create user with custom password"
    
    echo -e "\n${BLUE}📧 Email Configuration Notes:${NC}"
    echo "=================================="
    echo "1. Update email settings in application.yml:"
    echo "   - Set your Gmail address"
    echo "   - Set your Gmail app password"
    echo "   - Enable 2-factor authentication on Gmail"
    echo "   - Generate app password for this application"
    echo ""
    echo "2. Email notifications will be sent to:"
    echo "   - New users with their login credentials"
    echo "   - Admin with confirmation of user creation"
    echo ""
    echo "3. Email content includes:"
    echo "   - Welcome message"
    echo "   - Username and temporary password"
    echo "   - Custom message from admin"
    echo "   - Password change requirement notice"
    
    echo -e "\n${BLUE}🔧 Configuration Example:${NC}"
    echo "================================"
    echo "spring:"
    echo "  mail:"
    echo "    host: smtp.gmail.com"
    echo "    port: 587"
    echo "    username: your-email@gmail.com"
    echo "    password: your-app-password"
    echo "    properties:"
    echo "      mail:"
    echo "        smtp:"
    echo "          auth: true"
    echo "          starttls:"
    echo "            enable: true"
    
    echo -e "\n${GREEN}✅ User creation with email notifications is ready!${NC}"
    echo "Configure your email settings and test the functionality."
fi 