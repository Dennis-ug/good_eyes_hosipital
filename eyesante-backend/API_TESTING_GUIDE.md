# API Testing Guide

This guide provides comprehensive testing instructions for the Eyesante Backend JWT Security and Role Management APIs.

## Prerequisites

1. **Start the application** (either locally or with Docker)
2. **Ensure database is running** and accessible
3. **Have curl or Postman** ready for testing

## Quick Start with Docker

```bash
# Start the application with Docker
docker-compose up --build

# Wait for services to be healthy
docker-compose ps
```

## 1. Health Check

**Endpoint:** `GET /api/auth/test`

```bash
curl http://localhost:5025/api/auth/test
```

**Expected Response:**
```json
"Authentication endpoint is working!"
```

## 2. User Creation (Super Admin Only)

**Endpoint:** `POST /api/auth/create-user`

**Note:** This endpoint requires SUPER_ADMIN role. You must first login as super admin to get a token.

### Step 1: Login as Super Admin
```bash
curl -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "superadmin123"
  }'
```

### Step 2: Create User with Super Admin Token
```bash
curl -X POST http://localhost:5025/api/auth/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "username": "testuser",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User"
}
```

**Error Response (if not super admin):**
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "You don't have permission to access this resource.",
  "path": "/api/auth/create-user",
  "timestamp": "2025-07-29 03:30:15"
}
```

## 3. User Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Expected Response:** Same as registration response

## 4. Super Admin Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "superadmin123"
  }'
```

## 5. Test Protected Endpoints

### 5.1 Without Token (Should Fail)

```bash
curl http://localhost:5025/api/test/authenticated
```

**Expected Response:** `401 Unauthorized`

### 5.2 With Token (Should Succeed)

```bash
# Replace YOUR_JWT_TOKEN with the actual token from login
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5025/api/test/authenticated
```

**Expected Response:**
```json
"Authenticated Content. Hello, testuser!"
```

## 6. Role Management (Super Admin Only)

### 6.1 Create Permission

```bash
curl -X POST http://localhost:5025/api/admin/permissions \
  -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CUSTOM_PERMISSION",
    "description": "Custom permission for testing",
    "resourceName": "CUSTOM",
    "actionName": "READ"
  }'
```

**Expected Response:**
```json
{
  "id": 13,
  "name": "CUSTOM_PERMISSION",
  "description": "Custom permission for testing",
  "resourceName": "CUSTOM",
  "actionName": "READ",
  "enabled": true
}
```

### 6.2 List All Permissions

```bash
curl -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN" \
  http://localhost:5025/api/admin/permissions
```

### 6.3 Create Role

```bash
curl -X POST http://localhost:5025/api/admin/roles \
  -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MODERATOR",
    "description": "Content moderator role",
    "permissionIds": [1, 2, 3]
  }'
```

**Expected Response:**
```json
{
  "id": 4,
  "name": "MODERATOR",
  "description": "Content moderator role",
  "enabled": true,
  "permissionIds": [1, 2, 3]
}
```

### 6.4 List All Roles

```bash
curl -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN" \
  http://localhost:5025/api/admin/roles
```

### 6.5 Update Role

```bash
curl -X PUT http://localhost:5025/api/admin/roles/4 \
  -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MODERATOR",
    "description": "Updated content moderator role",
    "permissionIds": [1, 2, 3, 4]
  }'
```

### 6.6 Delete Role

```bash
curl -X DELETE http://localhost:5025/api/admin/roles/4 \
  -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN"
```

## 7. Test Different Access Levels

### 7.1 Public Endpoint (No Auth Required)

```bash
curl http://localhost:5025/api/test/public
```

**Expected Response:**
```json
"Public Content."
```

### 7.2 User Role Endpoint

```bash
curl -H "Authorization: Bearer USER_JWT_TOKEN" \
  http://localhost:5025/api/test/user
```

### 7.3 Admin Role Endpoint

```bash
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  http://localhost:5025/api/test/admin
```

## 8. Error Testing

### 8.1 Invalid Login

```bash
curl -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nonexistent",
    "password": "wrongpassword"
  }'
```

**Expected Response:** `401 Unauthorized`

### 8.2 Unauthorized Admin Access

```bash
curl -H "Authorization: Bearer USER_JWT_TOKEN" \
  http://localhost:5025/api/admin/permissions
```

**Expected Response:** `403 Forbidden`

### 8.3 Invalid JWT Token

```bash
curl -H "Authorization: Bearer invalid.token.here" \
  http://localhost:5025/api/test/authenticated
```

**Expected Response:** `401 Unauthorized`

## 9. Automated Testing Script

Run the automated test script:

```bash
# Make the script executable
chmod +x test-apis.sh

# Run the tests
./test-apis.sh
```

## 10. Postman Collection

You can also import this collection into Postman:

```json
{
  "info": {
    "name": "Eyesante Backend API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5025/api/auth/test"
      }
    },
    {
      "name": "User Registration",
      "request": {
        "method": "POST",
        "url": "http://localhost:5025/api/auth/signup",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\"\n}"
        }
      }
    },
    {
      "name": "User Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5025/api/auth/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"password123\"\n}"
        }
      }
    },
    {
      "name": "Super Admin Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5025/api/auth/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"superadmin\",\n  \"password\": \"superadmin123\"\n}"
        }
      }
    },
    {
      "name": "Protected Endpoint",
      "request": {
        "method": "GET",
        "url": "http://localhost:5025/api/test/authenticated",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ]
      }
    },
    {
      "name": "Create Permission",
      "request": {
        "method": "POST",
        "url": "http://localhost:5025/api/admin/permissions",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{super_admin_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"TEST_PERMISSION\",\n  \"description\": \"Test permission\",\n  \"resourceName\": \"TEST\",\n  \"actionName\": \"READ\"\n}"
        }
      }
    },
    {
      "name": "List Permissions",
      "request": {
        "method": "GET",
        "url": "http://localhost:5025/api/admin/permissions",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{super_admin_token}}"
          }
        ]
      }
    },
    {
      "name": "Create Role",
      "request": {
        "method": "POST",
        "url": "http://localhost:5025/api/admin/roles",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{super_admin_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"TEST_ROLE\",\n  \"description\": \"Test role\",\n  \"permissionIds\": [1, 2]\n}"
        }
      }
    },
    {
      "name": "List Roles",
      "request": {
        "method": "GET",
        "url": "http://localhost:5025/api/admin/roles",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{super_admin_token}}"
          }
        ]
      }
    }
  ]
}
```

## 11. Expected Test Results

When running the automated tests, you should see:

- ✅ Health check passes
- ✅ User registration succeeds
- ✅ User login succeeds
- ✅ Super admin login succeeds
- ✅ Protected endpoints reject unauthorized access
- ✅ Protected endpoints accept authorized access
- ✅ Public endpoints are accessible
- ✅ Super admin can create permissions
- ✅ Super admin can list permissions
- ✅ Super admin can create roles
- ✅ Super admin can list roles
- ✅ Unauthorized users cannot access admin endpoints

## 12. Troubleshooting

### Common Issues:

1. **Connection refused**: Make sure the application is running
2. **401 Unauthorized**: Check JWT token validity
3. **403 Forbidden**: User doesn't have required role
4. **500 Internal Server Error**: Check application logs

### Check Application Logs:

```bash
# If using Docker
docker-compose logs app

# If running locally
tail -f logs/application.log
```

### Database Issues:

```bash
# Check database connection
docker-compose exec postgres psql -U postgres -d eyesante_db -c "SELECT * FROM users;"
``` 