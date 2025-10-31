# Complete API Documentation - Eye Clinic Management System

## Overview
Comprehensive API documentation for the Eye Clinic Management System with JWT authentication, role-based access control, and separate eye examination tracking.

## Base URL
```
http://localhost:5025/api
```

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles & Permissions
- **SUPER_ADMIN**: Full system access (all endpoints)
- **ADMIN**: Administrative access  
- **USER**: Basic access
- **RECEPTIONIST**: Patient registration and reception duties
- **OPTOMETRIST**: Eye examinations and optometry services
- **OPHTHALMOLOGIST**: Medical eye care and ophthalmology services

---

## 1. Authentication APIs

### Login
**POST** `/auth/login`
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string", 
  "tokenType": "Bearer",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "passwordChangeRequired": boolean,
  "roles": ["SUPER_ADMIN", "USER"],
  "accessTokenExpiresAt": "2024-01-01T12:00:00",
  "refreshTokenExpiresAt": "2024-01-08T12:00:00"
}
```

### Refresh Token
**POST** `/auth/refresh-token`
```json
{
  "refreshToken": "string"
}
```

### Change Password
**POST** `/auth/change-password`
```json
{
  "currentPassword": "string",
  "newPassword": "string", 
  "confirmPassword": "string"
}
```

### Test Auth
**GET** `/auth/test`

---

## 2. User Management

### Create User (SUPER_ADMIN only)
**POST** `/auth/create-user`
```json
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "password": "string (optional)",
  "roles": ["string"],
  "departmentId": "number",
  "sendEmailNotification": boolean,
  "customMessage": "string"
}
```

### Get All Users (SUPER_ADMIN only)
**GET** `/user-management/users`

### Get User by ID (SUPER_ADMIN only)
**GET** `/user-management/users/{id}`

### Get Users by Department (SUPER_ADMIN only)
**GET** `/user-management/users/department/{departmentId}`

### Assign Department to User (SUPER_ADMIN only)
**POST** `/user-management/assign-department`
```json
{
  "userId": "number",
  "departmentId": "number"
}
```

---

## 3. Patient Management

### Get All Patients
**GET** `/patients`

### Get Patient by ID  
**GET** `/patients/{id}`

### Create Patient (RECEPTIONIST, SUPER_ADMIN)
**POST** `/patients`
```json
{
  "firstName": "string",
  "lastName": "string",
  "gender": "string",
  "nationalId": "string",
  "dateOfBirth": "2024-01-01",
  "ageInYears": "number",
  "ageInMonths": "number",
  "maritalStatus": "string",
  "religion": "string",
  "occupation": "string",
  "nextOfKin": "string",
  "nextOfKinRelationship": "string",
  "nextOfKinPhone": "string",
  "phone": "string",
  "alternativePhone": "string",
  "phoneOwner": "string",
  "ownerName": "string",
  "patientCategory": "string",
  "company": "string",
  "preferredLanguage": "string",
  "citizenship": "string",
  "countryId": "string",
  "foreignerOrRefugee": "string",
  "nonUgandanNationalIdNo": "string",
  "residence": "string",
  "researchNumber": "string"
}
```

### Update Patient (RECEPTIONIST, SUPER_ADMIN, OPTOMETRIST, OPHTHALMOLOGIST)
**PUT** `/patients/{id}`

### Delete Patient (SUPER_ADMIN only)
**DELETE** `/patients/{id}`

---

## 4. Eye Examination Management

### Create Eye Examination (OPTOMETRIST, OPHTHALMOLOGIST, SUPER_ADMIN)
**POST** `/eye-examinations`
```json
{
  "patientId": "number",
  "examinerId": "number",
  "examinerName": "string",
  "chiefComplaint": "string",
  "visualAcuityRight": "string",
  "visualAcuityLeft": "string",
  "intraocularPressureRight": "number",
  "intraocularPressureLeft": "number",
  "refractionRight": "string",
  "refractionLeft": "string",
  "diagnosis": "string",
  "treatmentPlan": "string",
  "nextAppointment": "2024-01-01",
  "eyeHistory": "string",
  "familyEyeHistory": "string",
  "notes": "string"
}
```

### Get Patient's Eye Examinations (OPTOMETRIST, OPHTHALMOLOGIST, SUPER_ADMIN, RECEPTIONIST)
**GET** `/eye-examinations/patient/{patientId}`

### Get Latest Eye Examination (OPTOMETRIST, OPHTHALMOLOGIST, SUPER_ADMIN, RECEPTIONIST)
**GET** `/eye-examinations/patient/{patientId}/latest`

---

## 5. Reception APIs

### Receive New Patient (RECEPTIONIST, SUPER_ADMIN)
**POST** `/reception/receive-new-patient`
```json
{
  "firstName": "string",
  "lastName": "string",
  "gender": "string",
  "nationalId": "string",
  "dateOfBirth": "2024-01-01",
  "ageInYears": "number",
  "ageInMonths": "number",
  "maritalStatus": "string",
  "religion": "string",
  "occupation": "string",
  "nextOfKin": "string",
  "nextOfKinRelationship": "string",
  "nextOfKinPhone": "string",
  "phone": "string",
  "alternativePhone": "string",
  "phoneOwner": "string",
  "ownerName": "string",
  "patientCategory": "string",
  "company": "string",
  "preferredLanguage": "string",
  "citizenship": "string",
  "countryId": "string",
  "foreignerOrRefugee": "string",
  "nonUgandanNationalIdNo": "string",
  "residence": "string",
  "researchNumber": "string"
}
```

### Receive Returning Patient (RECEPTIONIST, SUPER_ADMIN)
**POST** `/reception/receive-returning-patient/{patientId}`

### Get Patients Received Today (RECEPTIONIST, SUPER_ADMIN)
**GET** `/reception/patients-received-today`

---

## 6. Optometry APIs

### Perform Eye Examination (OPTOMETRIST, OPHTHALMOLOGIST)
**POST** `/optometry/examine-patient/{patientId}`
```json
{
  "chiefComplaint": "string",
  "visualAcuityRight": "string",
  "visualAcuityLeft": "string",
  "intraocularPressureRight": "number",
  "intraocularPressureLeft": "number",
  "refractionRight": "string",
  "refractionLeft": "string",
  "diagnosis": "string",
  "treatmentPlan": "string",
  "nextAppointment": "2024-01-01",
  "eyeHistory": "string",
  "familyEyeHistory": "string",
  "notes": "string"
}
```

### Get Patients for Eye Examination (OPTOMETRIST, OPHTHALMOLOGIST)
**GET** `/optometry/patients-for-examination`

### Get Examinations with Diagnosis (OPTOMETRIST, OPHTHALMOLOGIST)
**GET** `/optometry/patients-with-diagnosis/{diagnosis}`

---

## 7. Department Management

### Get All Departments
**GET** `/departments`

### Get Department by ID
**GET** `/departments/{id}`

### Create Department
**POST** `/departments`
```json
{
  "name": "string",
  "description": "string"
}
```

### Update Department
**PUT** `/departments/{id}`

### Delete Department
**DELETE** `/departments/{id}`

---

## 8. Role Management (SUPER_ADMIN only)

### Get All Roles
**GET** `/admin/roles`

### Get Role by ID
**GET** `/admin/roles/{id}`

### Create Role
**POST** `/admin/roles`
```json
{
  "name": "string",
  "description": "string",
  "enabled": boolean,
  "permissionIds": [1, 2, 3]
}
```

### Update Role
**PUT** `/admin/roles/{id}`

### Delete Role
**DELETE** `/admin/roles/{id}`

---

## 9. Permission Management (SUPER_ADMIN only)

### Get All Permissions
**GET** `/admin/permissions`

### Get Permission by ID
**GET** `/admin/permissions/{id}`

### Create Permission
**POST** `/admin/permissions`
```json
{
  "name": "string",
  "description": "string",
  "resourceName": "string",
  "actionName": "string",
  "enabled": boolean
}
```

### Update Permission
**PUT** `/admin/permissions/{id}`

### Delete Permission
**DELETE** `/admin/permissions/{id}`

---

## 10. Test APIs

### Public Access
**GET** `/test/public`

### User Access (USER, ADMIN)
**GET** `/test/user`

### Admin Access (ADMIN only)
**GET** `/test/admin`

### Authenticated Access
**GET** `/test/authenticated`

---

## 11. Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "timestamp": "2024-01-01 12:00:00"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden", 
  "message": "Access denied",
  "timestamp": "2024-01-01 12:00:00"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "timestamp": "2024-01-01 12:00:00"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ],
  "timestamp": "2024-01-01 12:00:00"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-01-01 12:00:00"
}
```

---

## 12. JWT Token Errors

### Token Expired
```json
{
  "error": "Token Expired",
  "message": "Your authentication token has expired. Please login again.",
  "timestamp": "2024-01-01 12:00:00"
}
```

### Malformed Token
```json
{
  "error": "Malformed Token",
  "message": "The provided authentication token is malformed.",
  "timestamp": "2024-01-01 12:00:00"
}
```

### Invalid Token Signature
```json
{
  "error": "Invalid Token Signature",
  "message": "The token signature is invalid.",
  "timestamp": "2024-01-01 12:00:00"
}
```

---

## 13. Testing

### Default Credentials
```
Super Admin:
- Username: superadmin
- Password: superadmin123

Test Users:
- Username: optometrist
- Password: optometrist123
```

### Test Scripts
- `test-apis.sh` - Basic API testing
- `test-reception-apis.sh` - Reception testing  
- `test-user-creation-with-email.sh` - User creation testing
- `test-super-admin-patient-creation.sh` - Super admin patient creation testing
- `test-eye-examinations.sh` - Eye examination functionality testing

---

## 14. Security Features

- **JWT Tokens**: Access tokens expire in 24 hours, refresh tokens in 7 days
- **Password Security**: New users receive temporary passwords requiring change on first login
- **Role-Based Access**: All endpoints protected by role-based authorization
- **Email Notifications**: Welcome emails sent to new users when enabled
- **Audit Trail**: All patient interactions timestamped and tracked
- **Super Admin Privileges**: Super admins have access to all endpoints
- **Eye Examination History**: All eye examinations tracked separately with full history
- **Custom Error Handling**: JSON error responses for all JWT-related errors

---

## 15. Database Schema

### Core Tables
- `users` - User accounts and authentication
- `roles` - User roles and permissions
- `permissions` - Individual permissions
- `departments` - Hospital departments
- `patients` - Patient demographic information
- `eye_examinations` - Eye examination records
- `user_roles` - Many-to-many user-role relationship
- `role_permissions` - Many-to-many role-permission relationship

---

## 16. Deployment

### Docker Deployment
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Environment Variables
```bash
# JWT Configuration
APP_JWT_SECRET=your-base64-encoded-secret-key
APP_JWT_EXPIRATION_MILLISECONDS=86400000
APP_JWT_REFRESH_EXPIRATION_MILLISECONDS=604800000

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/eyesante_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

# Email Configuration
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

---

## 17. API Response Examples

### Successful Patient Creation
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "nationalId": "123456789",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 34,
  "ageInMonths": 0,
  "maritalStatus": "Single",
  "religion": "Christian",
  "occupation": "Engineer",
  "nextOfKin": "Jane Doe",
  "nextOfKinRelationship": "Wife",
  "nextOfKinPhone": "1234567890",
  "phone": "0987654321",
  "alternativePhone": "1122334455",
  "phoneOwner": "self",
  "ownerName": "",
  "patientCategory": "Cash",
  "company": "SELF EMPLOYED",
  "preferredLanguage": "eng",
  "citizenship": "1",
  "countryId": "",
  "foreignerOrRefugee": "",
  "nonUgandanNationalIdNo": "",
  "residence": "Kampala",
  "researchNumber": "",
  "receptionTimestamp": "2024-01-01T10:00:00",
  "receivedBy": "receptionist1",
  "latestEyeExamination": null
}
```

### Successful Eye Examination
```json
{
  "id": 1,
  "patientId": 1,
  "examinationDate": "2024-01-01T14:30:00",
  "examinerId": 2,
  "examinerName": "Dr. Smith",
  "chiefComplaint": "Blurred vision",
  "visualAcuityRight": "20/40",
  "visualAcuityLeft": "20/30",
  "intraocularPressureRight": 16.5,
  "intraocularPressureLeft": 15.8,
  "refractionRight": "-2.50 -0.50 x 90",
  "refractionLeft": "-2.00 -0.25 x 85",
  "diagnosis": "Myopia with astigmatism",
  "treatmentPlan": "Prescription glasses",
  "nextAppointment": "2024-02-15",
  "eyeHistory": "No previous eye problems",
  "familyEyeHistory": "Father has myopia",
  "notes": "Patient reports difficulty reading small text",
  "createdAt": "2024-01-01T14:30:00",
  "updatedAt": null
}
```

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Total Endpoints:** 50+  
**Authentication:** JWT Bearer Token  
**Database:** PostgreSQL  
**Framework:** Spring Boot 3.5.4 