#!/bin/bash

# Test script for deleting doctor schedules
BASE_URL="http://localhost:8080/api"
AUTH_TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Doctor Schedule Delete Endpoint${NC}"
echo "=================================="

# Function to login and get token
login() {
    echo -e "\n${YELLOW}Logging in as superadmin...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "superadmin",
            "password": "admin123"
        }')
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
        echo -e "${GREEN}Login successful!${NC}"
        echo "Token: ${AUTH_TOKEN:0:20}..."
    else
        echo -e "${RED}Login failed!${NC}"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
}

# Function to get all schedules
get_all_schedules() {
    echo -e "\n${YELLOW}Getting all doctor schedules...${NC}"
    SCHEDULES_RESPONSE=$(curl -s -X GET "${BASE_URL}/doctor-schedules?page=0&size=10" \
        -H "Authorization: Bearer ${AUTH_TOKEN}" \
        -H "Content-Type: application/json")
    
    if echo "$SCHEDULES_RESPONSE" | grep -q "content"; then
        echo -e "${GREEN}Successfully retrieved schedules${NC}"
        SCHEDULE_ID=$(echo "$SCHEDULES_RESPONSE" | jq -r '.content[0].id // empty')
        if [ -n "$SCHEDULE_ID" ] && [ "$SCHEDULE_ID" != "null" ]; then
            echo "Found schedule ID: $SCHEDULE_ID"
            return 0
        else
            echo -e "${RED}No schedules found to delete${NC}"
            return 1
        fi
    else
        echo -e "${RED}Failed to retrieve schedules${NC}"
        echo "Response: $SCHEDULES_RESPONSE"
        return 1
    fi
}

# Function to delete a schedule
delete_schedule() {
    local schedule_id=$1
    echo -e "\n${YELLOW}Deleting schedule with ID: $schedule_id${NC}"
    
    DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/doctor-schedules/${schedule_id}" \
        -H "Authorization: Bearer ${AUTH_TOKEN}" \
        -H "Content-Type: application/json")
    
    if echo "$DELETE_RESPONSE" | grep -q "success.*true"; then
        echo -e "${GREEN}Schedule deleted successfully!${NC}"
        echo "Response: $DELETE_RESPONSE"
        return 0
    else
        echo -e "${RED}Failed to delete schedule${NC}"
        echo "Response: $DELETE_RESPONSE"
        return 1
    fi
}

# Function to verify schedule is deleted
verify_deletion() {
    local schedule_id=$1
    echo -e "\n${YELLOW}Verifying schedule deletion...${NC}"
    
    VERIFY_RESPONSE=$(curl -s -X GET "${BASE_URL}/doctor-schedules/${schedule_id}" \
        -H "Authorization: Bearer ${AUTH_TOKEN}" \
        -H "Content-Type: application/json")
    
    if echo "$VERIFY_RESPONSE" | grep -q "Schedule not found"; then
        echo -e "${GREEN}Schedule successfully deleted and not found!${NC}"
        return 0
    else
        echo -e "${RED}Schedule still exists after deletion${NC}"
        echo "Response: $VERIFY_RESPONSE"
        return 1
    fi
}

# Function to test deleting non-existent schedule
test_delete_nonexistent() {
    echo -e "\n${YELLOW}Testing deletion of non-existent schedule...${NC}"
    
    DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/doctor-schedules/99999" \
        -H "Authorization: Bearer ${AUTH_TOKEN}" \
        -H "Content-Type: application/json")
    
    if echo "$DELETE_RESPONSE" | grep -q "Schedule not found"; then
        echo -e "${GREEN}Correctly handled non-existent schedule deletion${NC}"
        return 0
    else
        echo -e "${RED}Unexpected response for non-existent schedule${NC}"
        echo "Response: $DELETE_RESPONSE"
        return 1
    fi
}

# Main test execution
main() {
    # Login first
    login
    
    # Get a schedule to delete
    if get_all_schedules; then
        # Delete the schedule
        if delete_schedule "$SCHEDULE_ID"; then
            # Verify deletion
            verify_deletion "$SCHEDULE_ID"
        fi
    fi
    
    # Test deleting non-existent schedule
    test_delete_nonexistent
    
    echo -e "\n${GREEN}Delete schedule endpoint test completed!${NC}"
}

# Run the test
main 