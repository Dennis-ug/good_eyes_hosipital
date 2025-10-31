#!/bin/bash

# Test script for creating invoices
API_BASE="http://localhost:5025/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Testing Invoice Creation API..."

# Step 1: Get or create a test patient
echo "Step 1: Getting test patient..."
PATIENTS_RESPONSE=$(curl -s -X GET "$API_BASE/patients?page=0&size=1")
PATIENT_ID=$(echo "$PATIENTS_RESPONSE" | jq -r '.content[0].id // empty')

if [ -z "$PATIENT_ID" ] || [ "$PATIENT_ID" = "null" ]; then
    print_warning "No patients found. Creating a test patient..."
    
    CREATE_PATIENT_RESPONSE=$(curl -s -X POST "$API_BASE/patients" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-token-here>" \
        -d '{
            "firstName": "Test",
            "lastName": "Patient",
            "gender": "Male",
            "phone": "1234567890",
            "nationalId": "123456789",
            "dateOfBirth": "1990-01-01",
            "ageInYears": 33,
            "maritalStatus": "Single",
            "religion": "Christian",
            "occupation": "Engineer",
            "nextOfKin": "Jane Doe",
            "nextOfKinRelationship": "Spouse",
            "nextOfKinPhone": "0987654321",
            "residence": "Kampala",
            "patientCategory": "Regular",
            "citizenship": "Ugandan"
        }')
    
    PATIENT_ID=$(echo "$CREATE_PATIENT_RESPONSE" | jq -r '.id')
    if [ -n "$PATIENT_ID" ] && [ "$PATIENT_ID" != "null" ]; then
        print_success "Created test patient with ID: $PATIENT_ID"
    else
        print_error "Failed to create test patient"
        exit 1
    fi
else
    print_success "Found existing patient with ID: $PATIENT_ID"
fi

# Step 2: Get or create a test user (doctor)
echo "Step 2: Getting test user..."
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users?page=0&size=10")
USER_ID=$(echo "$USERS_RESPONSE" | jq -r '.content[] | select(.roles[]? | contains("DOCTOR")) | .id // empty' | head -1)

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    print_warning "No users with DOCTOR role found. Creating a test user..."
    
    CREATE_USER_RESPONSE=$(curl -s -X POST "$API_BASE/users" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-token-here>" \
        -d '{
            "username": "testdoctor",
            "password": "password123",
            "firstName": "Test",
            "lastName": "Doctor",
            "email": "testdoctor@example.com",
            "phone": "1234567890",
            "roles": ["DOCTOR"]
        }')
    
    USER_ID=$(echo "$CREATE_USER_RESPONSE" | jq -r '.id')
    if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        print_success "Created test user with ID: $USER_ID"
    else
        print_warning "Failed to create test user. Will proceed without user assignment."
        USER_ID=null
    fi
else
    print_success "Found existing user with ID: $USER_ID"
fi

# Function to create an invoice
create_invoice() {
    local patient_id=$1
    local user_id=$2
    
    local invoice_data='{
        "patientId": '$patient_id',
        "invoiceItems": [
            {
                "itemName": "Consultation Fee",
                "itemDescription": "Medical consultation",
                "itemType": "CONSULTATION",
                "quantity": 1,
                "unitPrice": 50.00,
                "taxPercentage": 18.00,
                "insuranceCovered": false
            },
            {
                "itemName": "Eye Examination",
                "itemDescription": "Comprehensive eye examination",
                "itemType": "EXAMINATION",
                "quantity": 1,
                "unitPrice": 100.00,
                "taxPercentage": 18.00,
                "insuranceCovered": false
            }
        ],
        "notes": "Test invoice created via API",
        "dueDate": "'$(date -d '+7 days' +%Y-%m-%d)'"
    }'
    
    if [ "$user_id" != "null" ] && [ -n "$user_id" ]; then
        # Add user assignment if available
        invoice_data=$(echo "$invoice_data" | jq --arg userId "$user_id" '. + {"userId": $userId}')
    fi
    
    local response=$(curl -s -X POST "$API_BASE/finance/invoices/create" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-token-here>" \
        -d "$invoice_data")
    
    echo "$response"
}

# Step 3: Create test invoice
echo "Step 3: Creating test invoice..."
INVOICE_RESPONSE=$(create_invoice "$PATIENT_ID" "$USER_ID")
INVOICE_ID=$(echo "$INVOICE_RESPONSE" | jq -r '.id')

if [ -n "$INVOICE_ID" ] && [ "$INVOICE_ID" != "null" ]; then
    print_success "Created test invoice with ID: $INVOICE_ID"
    echo "Invoice details:"
    echo "$INVOICE_RESPONSE" | jq '.'
else
    print_error "Failed to create test invoice"
    echo "Response: $INVOICE_RESPONSE"
    exit 1
fi

# Step 4: Test invoice retrieval
echo "Step 4: Testing invoice retrieval..."
GET_INVOICE_RESPONSE=$(curl -s -X GET "$API_BASE/finance/invoices/$INVOICE_ID" \
    -H "Authorization: Bearer <your-token-here>")

if echo "$GET_INVOICE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_success "Successfully retrieved invoice"
else
    print_error "Failed to retrieve invoice"
    echo "Response: $GET_INVOICE_RESPONSE"
fi

# Step 5: Test invoice listing
echo "Step 5: Testing invoice listing..."
LIST_INVOICES_RESPONSE=$(curl -s -X GET "$API_BASE/finance/invoices?page=0&size=5" \
    -H "Authorization: Bearer <your-token-here>")

if echo "$LIST_INVOICES_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
    print_success "Successfully retrieved invoice list"
    INVOICE_COUNT=$(echo "$LIST_INVOICES_RESPONSE" | jq -r '.totalElements')
    echo "Total invoices: $INVOICE_COUNT"
else
    print_error "Failed to retrieve invoice list"
    echo "Response: $LIST_INVOICES_RESPONSE"
fi

# Step 6: Test invoice by user (if user exists)
if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
    echo "Step 6: Testing invoice retrieval by user..."
    USER_INVOICES_RESPONSE=$(curl -s -X GET "$API_BASE/finance/invoices/user/$USER_ID?page=0&size=5" \
        -H "Authorization: Bearer <your-token-here>")
    
    if echo "$USER_INVOICES_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
        print_success "Successfully retrieved invoices for user $USER_ID"
        USER_INVOICE_COUNT=$(echo "$USER_INVOICES_RESPONSE" | jq -r '.totalElements')
        echo "Invoices for user: $USER_INVOICE_COUNT"
    else
        print_error "Failed to retrieve invoices for user"
        echo "Response: $USER_INVOICES_RESPONSE"
    fi
else
    print_warning "Skipping user-specific invoice test (no user available)"
fi

# Step 7: Test invoice by patient
echo "Step 7: Testing invoice retrieval by patient..."
PATIENT_INVOICES_RESPONSE=$(curl -s -X GET "$API_BASE/finance/invoices/patient/$PATIENT_ID?page=0&size=5" \
    -H "Authorization: Bearer <your-token-here>")

if echo "$PATIENT_INVOICES_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
    print_success "Successfully retrieved invoices for patient $PATIENT_ID"
    PATIENT_INVOICE_COUNT=$(echo "$PATIENT_INVOICES_RESPONSE" | jq -r '.totalElements')
    echo "Invoices for patient: $PATIENT_INVOICE_COUNT"
else
    print_error "Failed to retrieve invoices for patient"
    echo "Response: $PATIENT_INVOICES_RESPONSE"
fi

print_success "Invoice creation and retrieval tests completed!"
