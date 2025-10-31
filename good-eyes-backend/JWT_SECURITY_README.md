# JWT Security Implementation

This document describes the JWT (JSON Web Token) security implementation for the Eyesante Backend application.

## Overview

The JWT security system provides:
- User registration and authentication
- JWT token generation and validation
- Role-based access control
- Stateless authentication

## Components

### 1. Security Configuration (`SecurityConfig.java`)
- Configures Spring Security with JWT authentication
- Sets up stateless session management
- Defines public and protected endpoints
- Configures password encoding

### 2. JWT Token Provider (`JwtTokenProvider.java`)
- Generates JWT tokens
- Validates JWT tokens
- Extracts user information from tokens
- Configurable secret key and expiration time

### 3. JWT Authentication Filter (`JwtAuthenticationFilter.java`)
- Intercepts HTTP requests
- Extracts JWT tokens from Authorization headers
- Validates tokens and sets authentication context

### 4. User Entity (`User.java`)
- JPA entity for user data
- Implements Spring Security's UserDetails interface
- Supports role-based authorization (USER, ADMIN)

### 5. Authentication Service (`AuthService.java`)
- Handles user registration
- Manages user authentication
- Returns JWT tokens upon successful authentication

### 6. Controllers
- `AuthController`: Exposes authentication endpoints
- `TestController`: Demonstrates protected endpoints

## API Endpoints

### Public Endpoints (No Authentication Required)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/test` - Test endpoint
- `GET /api/test/public` - Public content

### Protected Endpoints (Authentication Required)
- `GET /api/test/authenticated` - Any authenticated user
- `GET /api/test/user` - Users with USER or ADMIN role
- `GET /api/test/admin` - Users with ADMIN role only

## Usage Examples

### 1. User Registration
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

### 3. Accessing Protected Endpoints
```bash
curl -X GET http://localhost:8080/api/test/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Configuration

### JWT Configuration (application.properties)
```properties
# JWT secret key (change in production)
app.jwt-secret=your-secret-key-here-make-it-long-and-secure-for-production

# JWT expiration time (24 hours in milliseconds)
app.jwt-expiration-milliseconds=86400000
```

### Database Configuration
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/eyesante_db
spring.datasource.username=postgres
spring.datasource.password=password
```

## Security Features

1. **Password Encryption**: Passwords are encrypted using BCrypt
2. **Token Expiration**: JWT tokens expire after 24 hours (configurable)
3. **Role-based Access**: Different endpoints require different user roles
4. **Stateless Authentication**: No server-side session storage
5. **CORS Support**: Configured for cross-origin requests

## Production Considerations

1. **Change JWT Secret**: Use a strong, unique secret key
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Consider shorter expiration times for sensitive applications
4. **Database Security**: Use strong database passwords and proper access controls
5. **Input Validation**: All inputs are validated using Bean Validation annotations

## Testing

The application includes test endpoints to verify the security implementation:

1. **Public Access**: `GET /api/test/public`
2. **Authenticated Access**: `GET /api/test/authenticated`
3. **User Role Access**: `GET /api/test/user`
4. **Admin Role Access**: `GET /api/test/admin`

## Dependencies

The following dependencies are required:
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- JWT libraries (jjwt-api, jjwt-impl, jjwt-jackson)
- PostgreSQL driver
- Lombok

All dependencies are already configured in the `pom.xml` file. 