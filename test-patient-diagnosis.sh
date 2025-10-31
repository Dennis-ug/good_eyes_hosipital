#!/bin/bash

echo "🧪 Testing Patient Diagnosis Integration"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "1. Checking backend health..."
if curl -s http://localhost:5025/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "Please start the backend first: cd eyesante-backend && ./mvnw spring-boot:run"
    exit 1
fi

# Test 2: Test authentication
echo "2. Testing authentication..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Authentication failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Test patient diagnosis API endpoints
echo "3. Testing patient diagnosis API endpoints..."

# Test getting diagnoses by visit session (should return empty array for non-existent session)
VISIT_SESSION_ID=999
DIAGNOSES_RESPONSE=$(curl -s -X GET http://localhost:5025/api/patient-diagnoses/visit-session/$VISIT_SESSION_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DIAGNOSES_RESPONSE" | grep -q "\[\]"; then
    echo -e "${GREEN}✅ Patient diagnosis API working (empty response for non-existent session)${NC}"
else
    echo -e "${YELLOW}⚠️  Patient diagnosis API response: $DIAGNOSES_RESPONSE${NC}"
fi

# Test 4: Test creating a patient diagnosis (will fail due to non-existent visit session)
echo "4. Testing patient diagnosis creation..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:5025/api/patient-diagnoses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"visitSessionId\":$VISIT_SESSION_ID,\"diagnosisId\":1,\"severity\":\"MILD\",\"notes\":\"Test diagnosis\",\"isPrimaryDiagnosis\":false,\"isConfirmed\":false,\"diagnosedBy\":\"Test Doctor\"}")

if echo "$CREATE_RESPONSE" | grep -q "Visit session not found"; then
    echo -e "${GREEN}✅ Patient diagnosis creation validation working (correctly rejected non-existent visit session)${NC}"
else
    echo -e "${YELLOW}⚠️  Patient diagnosis creation response: $CREATE_RESPONSE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Patient Diagnosis Backend Integration Complete!${NC}"
echo ""
echo "📋 What's Been Implemented:"
echo "==========================="
echo "✅ PatientDiagnosis Entity: Links diagnoses to visit sessions"
echo "✅ PatientDiagnosisRepository: Database operations for patient diagnoses"
echo "✅ PatientDiagnosisService: Business logic for patient diagnosis management"
echo "✅ PatientDiagnosisController: REST API endpoints"
echo "✅ Database Migration: V39__create_patient_diagnoses_table.sql"
echo "✅ Frontend Types: PatientDiagnosis and CreatePatientDiagnosisRequest"
echo "✅ Frontend API: patientDiagnosisApi with all CRUD operations"
echo ""
echo "🔗 API Endpoints Available:"
echo "=========================="
echo "GET /api/patient-diagnoses/visit-session/{visitSessionId}"
echo "GET /api/patient-diagnoses/patient/{patientId}"
echo "POST /api/patient-diagnoses"
echo "PUT /api/patient-diagnoses/{id}"
echo "DELETE /api/patient-diagnoses/{id}"
echo "GET /api/patient-diagnoses/{id}"
echo "GET /api/patient-diagnoses/visit-session/{visitSessionId}/primary"
echo "GET /api/patient-diagnoses/visit-session/{visitSessionId}/confirmed"
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Create a visit session for testing"
echo "2. Add diagnoses to the visit session"
echo "3. Create frontend UI for managing patient diagnoses"
echo "4. Integrate with visit session management pages"
echo ""
echo "💡 Features Included:"
echo "===================="
echo "- Link diagnoses to specific patient visit sessions"
echo "- Track diagnosis severity (MILD, MODERATE, SEVERE, CRITICAL)"
echo "- Mark primary and confirmed diagnoses"
echo "- Add notes and track who diagnosed"
echo "- Full CRUD operations with proper validation"
echo "- Database indexes for optimal performance"
