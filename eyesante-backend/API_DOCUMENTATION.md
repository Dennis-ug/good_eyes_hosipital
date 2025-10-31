# Eye Clinic Management System - API Documentation

## Overview
Comprehensive API documentation for the Eye Clinic Management System with role-based access control and separate eye examination tracking.

## Base URL
```
http://localhost:5025/api
```

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- **SUPER_ADMIN**: Full system access (can create users, manage patients, access all endpoints)
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
  "passwordChangeRequired": boolean,
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

## 7. User Management APIs (SUPER_ADMIN only)

### Get All Users
**GET** `/user-management/users`

### Get User by ID
**GET** `/user-management/users/{id}`

### Get Users by Department
**GET** `/user-management/users/department/{departmentId}`

### Assign Department to User
**POST** `/user-management/assign-department`
```json
{
  "userId": "number",
  "departmentId": "number"
}
```

---

## 8. Department Management

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

## 9. Role Management

### Get All Roles
**GET** `/roles`

### Create Role (SUPER_ADMIN only)
**POST** `/roles`
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```

### Update Role
**PUT** `/roles/{id}`

### Delete Role
**DELETE** `/roles/{id}`

---

## 10. Permission Management

### Get All Permissions
**GET** `/permissions`

### Create Permission (SUPER_ADMIN only)
**POST** `/permissions`
```json
{
  "name": "string",
  "description": "string",
  "resourceName": "string",
  "actionName": "string"
}
```

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

---

## 12. Testing

### Super Admin Credentials
```
Username: superadmin
Password: superadmin123
```

### Test Scripts
- `test-apis.sh` - Basic API testing
- `test-reception-apis.sh` - Reception testing  
- `test-user-creation-with-email.sh` - User creation testing
- `test-super-admin-patient-creation.sh` - Super admin patient creation testing
- `test-eye-examinations.sh` - Eye examination functionality testing

---

## 13. Security Notes

- **JWT Tokens**: Access tokens expire in 24 hours, refresh tokens in 7 days
- **Password Security**: New users receive temporary passwords requiring change on first login
- **Role-Based Access**: All endpoints protected by role-based authorization
- **Email Notifications**: Welcome emails sent to new users when enabled
- **Audit Trail**: All patient interactions timestamped and tracked
- **Super Admin Privileges**: Super admins have access to all endpoints including patient creation and deletion
- **Eye Examination History**: All eye examinations are tracked separately with full history

---

## 14. Deployment

### Docker Deployment
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Environment Variables
- `APP_JWT_SECRET`: JWT signing secret
- `APP_JWT_EXPIRATION_MILLISECONDS`: Access token expiration
- `APP_JWT_REFRESH_EXPIRATION_MILLISECONDS`: Refresh token expiration
- `SPRING_DATASOURCE_URL`: Database URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

---

**Last Updated:** January 2024  
**Version:** 1.0.0
