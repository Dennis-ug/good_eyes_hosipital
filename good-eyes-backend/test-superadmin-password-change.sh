#!/bin/bash

# Test script for super admin password change requirement
BASE_URL="http://localhost:8080/api"
AUTH_TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Super Admin Password Change Requirement${NC}"
echo "=============================================="

# Function to login as super admin
login_superadmin() {
    echo -e "\n${YELLOW}Logging in as superadmin...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "superadmin",
            "password": "superadmin123"
        }')
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
        PASSWORD_CHANGE_REQUIRED=$(echo "$LOGIN_RESPONSE" | jq -r '.passwordChangeRequired')
        
        echo -e "${GREEN}Login successful!${NC}"
        echo "Token: ${AUTH_TOKEN:0:20}..."
        echo "Password Change Required: $PASSWORD_CHANGE_REQUIRED"
        
        if [ "$PASSWORD_CHANGE_REQUIRED" = "true" ]; then
            echo -e "${GREEN}✅ Password change is required as expected!${NC}"
            return 0
        else
            echo -e "${RED}❌ Password change should be required but is not!${NC}"
            return 1
        fi
    else
        echo -e "${RED}Login failed!${NC}"
        echo "Response: $LOGIN_RESPONSE"
        return 1
    fi
}

# Function to change password
change_password() {
    echo -e "\n${YELLOW}Changing super admin password...${NC}"
    
    CHANGE_PASSWORD_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/change-password" \
        -H "Authorization: Bearer ${AUTH_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "currentPassword": "superadmin123",
            "newPassword": "NewSecurePassword123!",
            "confirmPassword": "NewSecurePassword123!"
        }')
    
    if echo "$CHANGE_PASSWORD_RESPONSE" | grep -q "success.*true"; then
        echo -e "${GREEN}✅ Password changed successfully!${NC}"
        echo "Response: $CHANGE_PASSWORD_RESPONSE"
        return 0
    else
        echo -e "${RED}❌ Failed to change password${NC}"
        echo "Response: $CHANGE_PASSWORD_RESPONSE"
        return 1
    fi
}

# Function to login with new password
login_with_new_password() {
    echo -e "\n${YELLOW}Logging in with new password...${NC}"
    
    NEW_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "superadmin",
            "password": "NewSecurePassword123!"
        }')
    
    if echo "$NEW_LOGIN_RESPONSE" | grep -q "token"; then
        NEW_PASSWORD_CHANGE_REQUIRED=$(echo "$NEW_LOGIN_RESPONSE" | jq -r '.passwordChangeRequired')
        
        echo -e "${GREEN}✅ Login with new password successful!${NC}"
        echo "Password Change Required: $NEW_PASSWORD_CHANGE_REQUIRED"
        
        if [ "$NEW_PASSWORD_CHANGE_REQUIRED" = "false" ]; then
            echo -e "${GREEN}✅ Password change requirement is now false as expected!${NC}"
            return 0
        else
            echo -e "${RED}❌ Password change should be false after changing password!${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Login with new password failed!${NC}"
        echo "Response: $NEW_LOGIN_RESPONSE"
        return 1
    fi
}

# Main test execution
main() {
    echo -e "${YELLOW}Step 1: Testing initial login with password change requirement${NC}"
    if login_superadmin; then
        echo -e "${YELLOW}Step 2: Testing password change functionality${NC}"
        if change_password; then
            echo -e "${YELLOW}Step 3: Testing login with new password${NC}"
            login_with_new_password
        fi
    fi
    
    echo -e "\n${GREEN}Super admin password change requirement test completed!${NC}"
}

# Run the test
main
