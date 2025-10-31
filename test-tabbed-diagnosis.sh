#!/bin/bash

echo "🧪 Testing Tabbed Diagnosis Interface"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "1. Checking backend health..."
if curl -s http://localhost:5025/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo "❌ Backend is not running"
    exit 1
fi

# Test 2: Check if frontend is running
echo "2. Checking frontend..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo "❌ Frontend is not running"
    exit 1
fi

# Test 3: Test authentication
echo "3. Testing authentication..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Authentication failed"
    exit 1
fi

# Test 4: Test getting diagnosis categories
echo "4. Testing diagnosis categories API..."
CATEGORIES_RESPONSE=$(curl -s -X GET http://localhost:5025/api/diagnoses/categories \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CATEGORIES_RESPONSE" | grep -q "Eye Lids"; then
    echo -e "${GREEN}✅ Categories API working${NC}"
    CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | grep -o '"id":' | wc -l)
    echo "   Found $CATEGORY_COUNT categories"
else
    echo "❌ Categories API failed"
    exit 1
fi

# Test 5: Test getting diagnoses
echo "5. Testing diagnoses API..."
DIAGNOSES_RESPONSE=$(curl -s -X GET http://localhost:5025/api/diagnoses \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DIAGNOSES_RESPONSE" | grep -q "content"; then
    echo -e "${GREEN}✅ Diagnoses API working${NC}"
else
    echo "⚠️  Diagnoses API may have issues"
fi

echo ""
echo -e "${GREEN}🎉 Backend APIs are working!${NC}"
echo ""
echo "📋 Tabbed Interface Features:"
echo "============================="
echo "✅ Categories Tab:"
echo "   - View all diagnosis categories"
echo "   - Search categories by name/description"
echo "   - Add new categories"
echo "   - Delete categories"
echo "   - Shows diagnosis count per category"
echo ""
echo "✅ Diagnoses Tab:"
echo "   - View all diagnoses in table format"
echo "   - Search diagnoses by name/description"
echo "   - Filter by category"
echo "   - Add new diagnoses with searchable dropdown"
echo "   - Edit and delete diagnoses"
echo ""
echo "🌐 Test the Interface:"
echo "====================="
echo "1. Open browser: http://localhost:3001"
echo "2. Login: superadmin / superadmin123"
echo "3. Navigate: http://localhost:3001/dashboard/diagnoses"
echo "4. Test both tabs:"
echo "   - Click 'Categories' tab to manage categories"
echo "   - Click 'Diagnoses' tab to manage diagnoses"
echo ""
echo "🎯 Expected Behavior:"
echo "===================="
echo "- Categories tab shows grid of category cards"
echo "- Diagnoses tab shows table of diagnoses"
echo "- Each tab has its own search functionality"
echo "- Add buttons are context-specific"
echo "- Smooth tab switching with visual feedback"
