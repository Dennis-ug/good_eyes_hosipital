# Eye Clinic Management System - API Documentation

## Base URL
```
http://localhost:5025/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Pagination
Most list endpoints support pagination with the following parameters:
- `page` - Page number (0-based, default: 0)
- `size` - Number of items per page (default: 20)
- `sort` - Sorting field and direction (e.g., `firstName,asc` or `createdAt,desc`)

Example: `GET /api/patients?page=0&size=10&sort=firstName,asc`

Pagination Response Format:
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "numberOfElements": 10
}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "username": "superadmin",
  "email": "admin@clinic.com",
  "firstName": "Super",
  "lastName": "Admin",
  "passwordChangeRequired": false,
  "roles": ["SUPER_ADMIN"],
  "accessTokenExpiresAt": "2025-07-31T10:30:00",
  "refreshTokenExpiresAt": "2025-08-06T10:30:00"
}
```

### 2. Refresh Token
**POST** `/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

### 3. Change Password
**POST** `/auth/change-password`

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

### 4. Create User (Super Admin Only)
**POST** `/auth/create-user`

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@clinic.com",
  "firstName": "John",
  "lastName": "Doe",
  "roleIds": [2],
  "departmentId": 1
}
```

---

## Patient Management

### 1. Get All Patients (Paginated)
**GET** `/patients?page=0&size=10&sort=firstName,asc`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "gender": "MALE",
      "nationalId": "123456789",
      "dateOfBirth": "1990-01-01",
      "ageInYears": 33,
      "ageInMonths": 396,
      "maritalStatus": "SINGLE",
      "religion": "CHRISTIAN",
      "occupation": "Engineer",
      "nextOfKin": "Jane Doe",
      "nextOfKinRelationship": "SPOUSE",
      "nextOfKinPhone": "+256123456789",
      "phone": "+256123456789",
      "alternativePhone": "+256987654321",
      "phoneOwner": "SELF",
      "ownerName": "John Doe",
      "patientCategory": "PRIVATE",
      "company": "Tech Corp",
      "preferredLanguage": "ENGLISH",
      "citizenship": "UGANDAN",
      "countryId": "UG",
      "foreignerOrRefugee": false,
      "nonUgandanNationalIdNo": null,
      "residence": "Kampala",
      "researchNumber": "RES001",
      "receptionTimestamp": "2025-07-30T10:00:00",
      "receivedBy": "system",
      "latestEyeExamination": {
        "id": 1,
        "diagnosis": "Myopia",
        "examinationDate": "2025-07-30T10:30:00"
      }
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

### 2. Get Patient by ID
**GET** `/patients/{id}`

**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  // ... same fields as above
}
```

### 3. Create Patient
**POST** `/patients`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "FEMALE",
  "nationalId": "987654321",
  "dateOfBirth": "1985-05-15",
  "maritalStatus": "MARRIED",
  "religion": "CHRISTIAN",
  "occupation": "Teacher",
  "nextOfKin": "John Smith",
  "nextOfKinRelationship": "SPOUSE",
  "nextOfKinPhone": "+256123456789",
  "phone": "+256123456789",
  "patientCategory": "PRIVATE",
  "residence": "Kampala"
}
```

### 4. Update Patient
**PUT** `/patients/{id}`

**Request Body:** Same as create patient

### 5. Delete Patient
**DELETE** `/patients/{id}`

---

## Reception Management

### 1. Receive New Patient
**POST** `/reception/receive-new-patient`

**Request Body:** Same as create patient

### 2. Receive Returning Patient
**POST** `/reception/receive-returning-patient/{patientId}`

### 3. Get Patients Received Today (Paginated)
**GET** `/reception/patients-received-today?page=0&size=10`

**Response:** Same pagination format as patients

---

## Eye Examination Management

### 1. Create Eye Examination
**POST** `/eye-examinations`

**Request Body:**
```json
{
  "patientId": 1,
  "chiefComplaint": "Blurred vision",
  "visualAcuityRight": "6/6",
  "visualAcuityLeft": "6/9",
  "intraocularPressureRight": 16,
  "intraocularPressureLeft": 18,
  "refractionRight": "-2.00",
  "refractionLeft": "-1.50",
  "diagnosis": "Myopia",
  "treatmentPlan": "Prescription glasses",
  "nextAppointment": "2025-08-15T10:00:00",
  "eyeHistory": "No previous eye problems",
  "familyEyeHistory": "Father has myopia",
  "notes": "Patient needs regular checkups"
}
```

### 2. Get Patient Eye Examinations (Paginated)
**GET** `/eye-examinations/patient/{patientId}?page=0&size=10`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "examinationDate": "2025-07-30T10:30:00",
      "examinerId": 2,
      "examinerName": "Dr. Smith",
      "chiefComplaint": "Blurred vision",
      "visualAcuityRight": "6/6",
      "visualAcuityLeft": "6/9",
      "intraocularPressureRight": 16,
      "intraocularPressureLeft": 18,
      "refractionRight": "-2.00",
      "refractionLeft": "-1.50",
      "diagnosis": "Myopia",
      "treatmentPlan": "Prescription glasses",
      "nextAppointment": "2025-08-15T10:00:00",
      "eyeHistory": "No previous eye problems",
      "familyEyeHistory": "Father has myopia",
      "notes": "Patient needs regular checkups",
      "createdAt": "2025-07-30T10:30:00",
      "updatedAt": "2025-07-30T10:30:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true
}
```

### 3. Get Latest Eye Examination
**GET** `/eye-examinations/patient/{patientId}/latest`

**Response:** Single eye examination object (not paginated)

---

## Optometry Management

### 1. Perform Eye Examination
**POST** `/optometry/examine-patient/{patientId}`

**Request Body:** Same as create eye examination

### 2. Get Patients for Examination (Paginated)
**GET** `/optometry/patients-for-examination?page=0&size=10`

**Response:** Same pagination format as patients

### 3. Get Patients with Diagnosis (Paginated)
**GET** `/optometry/patients-with-diagnosis/{diagnosis}?page=0&size=10`

**Response:** Paginated list of eye examinations with the specified diagnosis

---

## User Management (Super Admin Only)

### 1. Get All Users (Paginated)
**GET** `/user-management/users?page=0&size=10`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "username": "superadmin",
      "email": "admin@clinic.com",
      "firstName": "Super",
      "lastName": "Admin",
      "enabled": true,
      "passwordChangeRequired": false,
      "roles": [
        {
          "id": 1,
          "name": "SUPER_ADMIN",
          "description": "Super Administrator",
          "enabled": true
        }
      ],
      "department": {
        "id": 1,
        "name": "Administration",
        "description": "Handles administrative tasks and management",
        "enabled": true
      }
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true
}
```

### 2. Get User by ID
**GET** `/user-management/users/{id}`

### 3. Get Users by Department (Paginated)
**GET** `/user-management/users/department/{departmentId}?page=0&size=10`

### 4. Assign Department to User
**POST** `/user-management/assign-department`

**Request Body:**
```json
{
  "userId": 1,
  "departmentId": 2
}
```

---

## Role & Permission Management (Super Admin Only)

### 1. Get All Permissions (Paginated)
**GET** `/admin/permissions?page=0&size=10`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "CREATE_PATIENT",
      "description": "Can create new patients",
      "resourceName": "PATIENT",
      "actionName": "CREATE",
      "enabled": true
    }
  ],
  "totalElements": 20,
  "totalPages": 2,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

### 2. Get Permission by ID
**GET** `/admin/permissions/{id}`

### 3. Create Permission
**POST** `/admin/permissions`

**Request Body:**
```json
{
  "name": "UPDATE_PATIENT",
  "description": "Can update patient information",
  "resourceName": "PATIENT",
  "actionName": "UPDATE",
  "enabled": true
}
```

### 4. Update Permission
**PUT** `/admin/permissions/{id}`

### 5. Delete Permission
**DELETE** `/admin/permissions/{id}`

### 6. Get All Roles (Paginated)
**GET** `/admin/roles?page=0&size=10`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "SUPER_ADMIN",
      "description": "Super Administrator",
      "enabled": true,
      "permissionIds": [1, 2, 3, 4, 5]
    }
  ],
  "totalElements": 8,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true
}
```

### 7. Get Role by ID
**GET** `/admin/roles/{id}`

### 8. Create Role
**POST** `/admin/roles`

**Request Body:**
```json
{
  "name": "OPTOMETRIST",
  "description": "Optometrist role",
  "enabled": true,
  "permissionIds": [1, 2, 3]
}
```

### 9. Update Role
**PUT** `/admin/roles/{id}`

### 10. Delete Role
**DELETE** `/admin/roles/{id}`

---

## Department Management

### 1. Get All Departments (Paginated)
**GET** `/departments?page=0&size=10`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Reception",
      "description": "Handles new and returning patients, general registration",
      "enabled": true
    },
    {
      "id": 2,
      "name": "Optometry",
      "description": "Handles eye examinations and vision testing",
      "enabled": true
    },
    {
      "id": 3,
      "name": "Ophthalmology",
      "description": "Handles medical eye care and treatments",
      "enabled": true
    }
  ],
  "totalElements": 8,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true
}
```

### 2. Create Department
**POST** `/departments`

**Request Body:**
```json
{
  "name": "New Department",
  "description": "Description of the new department",
  "enabled": true
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required",
  "path": "/api/patients",
  "timestamp": "2025-07-30T10:00:00"
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "You don't have permission to access this resource",
  "path": "/api/admin/permissions",
  "timestamp": "2025-07-30T10:00:00"
}
```

### 404 Not Found
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found",
  "path": "/api/patients/999",
  "timestamp": "2025-07-30T10:00:00"
}
```

### 400 Bad Request
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/patients",
  "timestamp": "2025-07-30T10:00:00"
}
```

---

## Role-Based Access Control

### Available Roles:
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `RECEPTIONIST` - Patient registration and reception
- `OPTOMETRIST` - Eye examinations and optometry
- `OPHTHALMOLOGIST` - Medical eye care
- `USER` - Basic user access

### Permission-Based Access:
- `CREATE_PATIENT` - Can create patients
- `UPDATE_PATIENT` - Can update patient information
- `DELETE_PATIENT` - Can delete patients
- `VIEW_PATIENTS` - Can view patient lists
- `CREATE_EXAMINATION` - Can create eye examinations
- `VIEW_EXAMINATIONS` - Can view eye examinations
- `MANAGE_USERS` - Can manage users
- `MANAGE_ROLES` - Can manage roles and permissions

---

## Testing Credentials

### Super Admin:
- **Username:** `superadmin`
- **Password:** `admin123`

### Default Departments:
1. Reception
2. Optometry
3. Ophthalmology
4. Contact Lens
5. Optical
6. Surgery
7. Emergency
8. Administration

---

## Notes for Frontend Implementation

1. **Pagination**: Always include pagination parameters for list endpoints
2. **Authentication**: Store JWT tokens securely and include in all requests
3. **Error Handling**: Implement proper error handling for all API responses
4. **Loading States**: Show loading indicators during API calls
5. **Form Validation**: Implement client-side validation before API calls
6. **Refresh Tokens**: Implement automatic token refresh when access token expires
7. **Role-Based UI**: Show/hide UI elements based on user roles
8. **Responsive Design**: Ensure the interface works on different screen sizes

---

## CORS Configuration
The API supports CORS with the following configuration:
- Allowed Origins: `*`
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed Headers: `*`
- Exposed Headers: `Authorization`, `Content-Type` 