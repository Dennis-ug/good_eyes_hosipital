#!/bin/bash

# Test script for creating invoice from procedures
# This script tests the new functionality to create invoices from patient procedures

BASE_URL="http://localhost:5025"
TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Invoice Creation from Procedures ===${NC}"

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data"
    else
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN"
    fi
}

# Function to extract JSON value
extract_value() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\":[^,}]*" | cut -d':' -f2 | tr -d '"' | tr -d ' '
}

# Step 1: Create a patient visit session
echo -e "${YELLOW}Step 1: Creating a patient visit session...${NC}"

VISIT_SESSION_DATA='{
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye examination needed",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "consultationFeeAmount": 50.00
}'

VISIT_SESSION_RESPONSE=$(make_request "POST" "/api/patient-visit-sessions" "$VISIT_SESSION_DATA")
echo "Visit Session Response: $VISIT_SESSION_RESPONSE"

VISIT_SESSION_ID=$(extract_value "$VISIT_SESSION_RESPONSE" "id")
if [ -z "$VISIT_SESSION_ID" ]; then
    echo -e "${RED}Failed to create visit session${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Visit session created with ID: $VISIT_SESSION_ID${NC}"

# Step 2: Add some procedures to the visit session
echo -e "${YELLOW}Step 2: Adding procedures to the visit session...${NC}"

# Add first procedure
PROCEDURE_1_DATA='{
  "visitSessionId": '$VISIT_SESSION_ID',
  "procedureId": 1,
  "eyeSide": "BOTH",
  "cost": 25000,
  "performed": true,
  "performedBy": "Dr. Smith",
  "staffFee": 5000,
  "notes": "Slit lamp examination completed"
}'

PROCEDURE_1_RESPONSE=$(make_request "POST" "/api/patient-procedures" "$PROCEDURE_1_DATA")
echo "Procedure 1 Response: $PROCEDURE_1_RESPONSE"

# Add second procedure
PROCEDURE_2_DATA='{
  "visitSessionId": '$VISIT_SESSION_ID',
  "procedureId": 2,
  "eyeSide": "BOTH",
  "cost": 35000,
  "performed": true,
  "performedBy": "Dr. Smith",
  "staffFee": 7000,
  "notes": "Fundus examination completed"
}'

PROCEDURE_2_RESPONSE=$(make_request "POST" "/api/patient-procedures" "$PROCEDURE_2_DATA")
echo "Procedure 2 Response: $PROCEDURE_2_RESPONSE"

echo -e "${GREEN}✓ Procedures added to visit session${NC}"

# Step 3: Create invoice from procedures
echo -e "${YELLOW}Step 3: Creating invoice from procedures...${NC}"

INVOICE_RESPONSE=$(make_request "POST" "/api/appointments/visit-sessions/$VISIT_SESSION_ID/create-invoice-from-procedures")
echo "Invoice Response: $INVOICE_RESPONSE"

INVOICE_ID=$(extract_value "$INVOICE_RESPONSE" "id")
INVOICE_NUMBER=$(extract_value "$INVOICE_RESPONSE" "invoiceNumber")
TOTAL_AMOUNT=$(extract_value "$INVOICE_RESPONSE" "totalAmount")

if [ -n "$INVOICE_ID" ]; then
    echo -e "${GREEN}✓ Invoice created successfully!${NC}"
    echo -e "${GREEN}  Invoice ID: $INVOICE_ID${NC}"
    echo -e "${GREEN}  Invoice Number: $INVOICE_NUMBER${NC}"
    echo -e "${GREEN}  Total Amount: $TOTAL_AMOUNT UGX${NC}"
else
    echo -e "${RED}✗ Failed to create invoice from procedures${NC}"
    exit 1
fi

# Step 4: Verify the invoice details
echo -e "${YELLOW}Step 4: Verifying invoice details...${NC}"

INVOICE_DETAILS_RESPONSE=$(make_request "GET" "/api/finance/invoices/$INVOICE_ID")
echo "Invoice Details Response: $INVOICE_DETAILS_RESPONSE"

# Check if invoice has the correct number of items
ITEM_COUNT=$(echo "$INVOICE_DETAILS_RESPONSE" | grep -o '"invoiceItems":\[[^]]*\]' | grep -o '\[.*\]' | jq 'length' 2>/dev/null || echo "0")

if [ "$ITEM_COUNT" -ge 2 ]; then
    echo -e "${GREEN}✓ Invoice has $ITEM_COUNT items (procedures)${NC}"
else
    echo -e "${RED}✗ Invoice should have at least 2 items${NC}"
fi

# Step 5: Verify visit session is linked to invoice
echo -e "${YELLOW}Step 5: Verifying visit session is linked to invoice...${NC}"

VISIT_SESSION_DETAILS_RESPONSE=$(make_request "GET" "/api/patient-visit-sessions/$VISIT_SESSION_ID")
echo "Visit Session Details Response: $VISIT_SESSION_DETAILS_RESPONSE"

VISIT_INVOICE_ID=$(extract_value "$VISIT_SESSION_DETAILS_RESPONSE" "invoiceId")

if [ "$VISIT_INVOICE_ID" = "$INVOICE_ID" ]; then
    echo -e "${GREEN}✓ Visit session is correctly linked to the created invoice${NC}"
else
    echo -e "${RED}✗ Visit session is not linked to the created invoice${NC}"
fi

echo -e "${BLUE}=== Test Completed Successfully! ===${NC}"
echo -e "${GREEN}Summary:${NC}"
echo -e "  • Visit Session ID: $VISIT_SESSION_ID"
echo -e "  • Invoice ID: $INVOICE_ID"
echo -e "  • Invoice Number: $INVOICE_NUMBER"
echo -e "  • Total Amount: $TOTAL_AMOUNT UGX"
echo -e "  • Procedures added: 2"
echo -e "  • Invoice items: $ITEM_COUNT"
