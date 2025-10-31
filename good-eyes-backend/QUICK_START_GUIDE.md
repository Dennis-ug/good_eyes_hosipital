# 🚀 Quick Start Guide - Eyesante Eye Clinic Management System

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL database

## 🏃‍♂️ Quick Setup

### 1. Start the Application
```bash
mvn spring-boot:run
```

### 2. Test the APIs
```bash
./test-reception-apis.sh
```

## 🔐 Default Credentials

### Super Admin
- **Username:** `superadmin`
- **Password:** `superadmin123`
- **Role:** `SUPER_ADMIN`

## 👁️ Eye Clinic Departments

The system automatically creates these eye clinic departments:
1. **Reception** - Patient registration and management
2. **Optometry** - Eye examinations and vision testing
3. **Ophthalmology** - Medical eye care and treatments
4. **Contact Lens** - Contact lens fitting and management
5. **Optical** - Eyeglass dispensing and frame selection
6. **Surgery** - Eye surgeries and procedures
7. **Emergency** - Emergency eye care and urgent cases
8. **Administration** - Administrative tasks and management

## 🔑 Eye Clinic Roles

1. **SUPER_ADMIN** - Full system access
2. **ADMIN** - Administrative access
3. **USER** - Basic user access
4. **RECEPTIONIST** - Patient registration access
5. **OPTOMETRIST** - Eye examinations and vision testing
6. **OPHTHALMOLOGIST** - Medical eye care and treatments

## 📋 Eye Clinic API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/create-user` - Create user (Super Admin only)
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/change-password` - Change password

### Department Management
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create new department

### Reception Activities
- `POST /api/reception/receive-new-patient` - Register new patient
- `POST /api/reception/receive-returning-patient/{id}` - Register returning patient
- `GET /api/reception/patients-today` - View today's patients

### Optometry Activities
- `POST /api/optometry/examine-patient/{id}` - Perform eye examination
- `GET /api/optometry/patients-for-examination` - Get patients needing examination
- `GET /api/optometry/patients-with-diagnosis` - Get diagnosed patients

### Patient Management
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create patient (Receptionist only)
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### User Management (Super Admin only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user by ID
- `GET /api/admin/users/department/{name}` - Get users by department
- `POST /api/admin/users/assign-department` - Assign department to user

### Role & Permission Management (Super Admin only)
- `GET /api/admin/roles` - List all roles
- `POST /api/admin/roles` - Create new role
- `GET /api/admin/permissions` - List all permissions
- `POST /api/admin/permissions` - Create new permission

## 👁️ Eye-Specific Patient Fields

The system now includes comprehensive eye examination fields:

### Basic Patient Info
- Personal demographics (name, age, contact info)
- Medical history
- Family eye history

### Eye Examination Data
- **Chief Complaint** - Patient's main eye problem
- **Visual Acuity** - Right and left eye vision measurements
- **Intraocular Pressure** - Right and left eye pressure readings
- **Refraction** - Right and left eye prescription data
- **Diagnosis** - Eye condition diagnosis
- **Treatment Plan** - Recommended treatment
- **Next Appointment** - Follow-up scheduling
- **Eye History** - Previous eye conditions
- **Family Eye History** - Family eye disease history

## 🧪 Testing Examples

### 1. Login as Super Admin
```bash
curl -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "superadmin123"}'
```

### 2. Create Optometrist User
```bash
curl -X POST http://localhost:5025/api/auth/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "optometrist1",
    "email": "optometrist1@eyesante.com",
    "firstName": "Dr. Sarah",
    "lastName": "Optometrist",
    "password": "optometry123"
  }'
```

### 3. Perform Eye Examination
```bash
curl -X POST http://localhost:5025/api/optometry/examine-patient/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OPTOMETRIST_TOKEN" \
  -d '{
    "chiefComplaint": "Blurred vision in right eye",
    "visualAcuityRight": "20/40",
    "visualAcuityLeft": "20/20",
    "intraocularPressureRight": 16.5,
    "intraocularPressureLeft": 15.0,
    "refractionRight": "-2.50 -0.50 x 90",
    "refractionLeft": "-1.75 -0.25 x 85",
    "diagnosis": "Myopia with astigmatism",
    "treatmentPlan": "Prescription glasses",
    "nextAppointment": "2025-08-15",
    "eyeHistory": "No previous eye surgery",
    "familyEyeHistory": "Father has glaucoma"
  }'
```

## 🔧 Configuration

### Database Configuration
Update `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://your-db-host:5432/your-db-name
    username: your-username
    password: your-password
```

### JWT Configuration
```yaml
app:
  jwt-secret: your-secret-key
  jwt-expiration-milliseconds: 86400000
  jwt-refresh-expiration-milliseconds: 604800000
```

## 🚨 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Different permissions for different eye clinic roles
- **Department-based Access** - Users can only access their department's functions
- **Audit Trail** - All patient interactions are logged with timestamps
- **Input Validation** - Comprehensive validation for all inputs

## 📊 Eye Clinic Features

### Reception Department
- ✅ Receive new patients
- ✅ Register returning patients
- ✅ View daily patient list
- ✅ Update patient information

### Optometry Department
- ✅ Perform comprehensive eye examinations
- ✅ Record visual acuity measurements
- ✅ Document intraocular pressure readings
- ✅ Manage refraction data
- ✅ Track patients needing examination
- ✅ View diagnosed patients

### Ophthalmology Department
- ✅ Medical eye care and treatments
- ✅ Advanced eye examinations
- ✅ Treatment planning
- ✅ Surgical consultations

### Patient Management
- ✅ Complete patient registration with eye-specific fields
- ✅ Store comprehensive eye examination data
- ✅ Track patient visits and follow-ups
- ✅ Manage patient categories and insurance

### User Management
- ✅ Create users with eye clinic specific roles
- ✅ Assign users to eye clinic departments
- ✅ Manage permissions for different eye care activities
- ✅ Temporary password system

## 🆘 Troubleshooting

### Common Issues

1. **Application won't start**
   - Check database connection
   - Verify Java version (17+)
   - Check port 5025 availability

2. **Login fails**
   - Verify super admin credentials
   - Check database initialization
   - Restart application

3. **API calls fail**
   - Check JWT token validity
   - Verify user permissions
   - Check request format

### Logs
Check application logs for detailed error messages:
```bash
tail -f logs/application.log
```

## 📞 Support

For issues or questions:
1. Check the API documentation (`API_DOCUMENTATION.md`)
2. Run the test script (`test-reception-apis.sh`)
3. Review application logs
4. Verify database connectivity

---

**🎉 You're all set! The Eyesante Eye Clinic Management System is ready for comprehensive eye care management.** 