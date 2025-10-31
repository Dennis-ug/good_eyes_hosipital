#!/bin/bash

# Eyesante Inventory API Test Script
BASE_URL="http://localhost:5025"
ACCESS_TOKEN=""

echo "🔍 Eyesante Inventory API Test Script"
echo "===================================="

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "📋 Testing: $description"
    echo "🔗 $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        echo "📦 Request Data: $data"
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -X "$method" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    echo "📊 Status Code: $http_code"
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ Success"
        echo "📄 Response: $response_body" | jq '.' 2>/dev/null || echo "📄 Response: $response_body"
    else
        echo "❌ Failed"
        echo "📄 Error Response: $response_body"
    fi
    echo "----------------------------------------"
}

# Login to get access token
echo "🔐 Logging in to get access token..."
login_response=$(curl -s -H "Content-Type: application/json" \
    -d '{"username": "superadmin", "password": "superadmin123"}' \
    "$BASE_URL/api/auth/login")

ACCESS_TOKEN=$(echo "$login_response" | jq -r '.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Login failed. Please check credentials."
    echo "Response: $login_response"
    exit 1
fi

echo "✅ Login successful. Access token obtained."

# Test Inventory Category APIs
echo ""
echo "📋 INVENTORY CATEGORY TESTS"
echo "==========================="

# Create a new category
create_category_data='{
  "name": "Test Category",
  "description": "Test category for API testing"
}'

make_request "POST" "/api/inventory/categories" "$create_category_data" "Create Inventory Category"

# Get all categories
make_request "GET" "/api/inventory/categories?page=0&size=10" "" "Get All Categories"

# Get active categories
make_request "GET" "/api/inventory/categories/active" "" "Get Active Categories"

# Search categories
make_request "GET" "/api/inventory/categories/search?name=Test" "" "Search Categories by Name"

# Test Inventory Item APIs
echo ""
echo "📋 INVENTORY ITEM TESTS"
echo "======================="

# Create a new item
create_item_data='{
  "name": "Test Item",
  "description": "Test inventory item for API testing",
  "sku": "TEST-001",
  "unitPrice": 25.99,
  "costPrice": 15.50,
  "quantityInStock": 100,
  "minimumStockLevel": 10,
  "maximumStockLevel": 200,
  "unitOfMeasure": "units",
  "categoryId": 1,
  "supplierName": "Test Supplier",
  "supplierContact": "test@supplier.com",
  "reorderPoint": 15,
  "reorderQuantity": 50
}'

make_request "POST" "/api/inventory/items" "$create_item_data" "Create Inventory Item"

# Get all items
make_request "GET" "/api/inventory/items?page=0&size=10" "" "Get All Items"

# Get active items
make_request "GET" "/api/inventory/items/active" "" "Get Active Items"

# Get items by category
make_request "GET" "/api/inventory/items/category/1" "" "Get Items by Category"

# Get low stock items
make_request "GET" "/api/inventory/items/low-stock" "" "Get Low Stock Items"

# Search items by name
make_request "GET" "/api/inventory/items/search/name?name=Test" "" "Search Items by Name"

# Update stock quantity
make_request "PUT" "/api/inventory/items/1/stock?quantity=150" "" "Update Stock Quantity"

echo ""
echo "🎉 Inventory API testing completed!"
echo "📊 Check the results above for any failed endpoints." 