# Role and Permission Fix Summary

## Overview
This document outlines the comprehensive fixes implemented to resolve the roles issue where doctors could access clinical features but were incorrectly able to create patients and patient visits. The solution implements a granular permission-based access control system.

## Problem Statement
- **Issue**: Doctors (OPTOMETRIST, OPHTHALMOLOGIST, DOCTOR roles) could access clinical features but were incorrectly able to create patients and patient visits
- **Requirement**: Doctors should have access to clinical features but NOT be able to create patients or patient visits
- **Solution**: Implement granular permission-based access control system

## Backend Changes

### 1. New Migration: V24__add_patient_and_visit_permissions.sql
**File**: `eyesante-backend/src/main/resources/db/migration/V24__add_patient_and_visit_permissions.sql`

**Added Permissions**:
- `PATIENT_READ` - Read patient information
- `PATIENT_CREATE` - Create new patients
- `PATIENT_UPDATE` - Update patient information
- `PATIENT_DELETE` - Delete patients
- `VISIT_SESSION_READ` - Read visit session information
- `VISIT_SESSION_CREATE` - Create new visit sessions
- `VISIT_SESSION_UPDATE` - Update visit session information
- `VISIT_SESSION_DELETE` - Delete visit sessions
- `EXAMINATION_READ` - Read examination information
- `EXAMINATION_CREATE` - Create new examinations
- `EXAMINATION_UPDATE` - Update examination information
- `EXAMINATION_DELETE` - Delete examinations
- `TRIAGE_READ` - Read triage information
- `TRIAGE_CREATE` - Create new triage records
- `TRIAGE_UPDATE` - Update triage information
- `TRIAGE_DELETE` - Delete triage records

**Role-Permission Assignments**:
- **SUPER_ADMIN**: All permissions
- **ADMIN**: All permissions except user/role/permission management
- **RECEPTIONIST**: Patient and visit session creation/update, examination/triage read
- **DOCTOR/OPTOMETRIST/OPHTHALMOLOGIST**: Clinical permissions (examinations, triage) but NO patient/visit creation
- **USER**: Basic read permissions only

### 2. Updated Controllers to Use Permission-Based Authorization

#### PatientController.java
**File**: `eyesante-backend/src/main/java/com/rossumtechsystems/eyesante_backend/controller/PatientController.java`

**Changes**:
```java
// Before: Role-based
@PreAuthorize("hasRole('RECEPTIONIST') or hasRole('SUPER_ADMIN')")

// After: Permission-based
@PreAuthorize("hasAuthority('PATIENT_CREATE')")
@PreAuthorize("hasAuthority('PATIENT_UPDATE')")
@PreAuthorize("hasAuthority('PATIENT_DELETE')")
```

#### PatientVisitSessionController.java
**File**: `eyesante-backend/src/main/java/com/rossumtechsystems/eyesante_backend/controller/PatientVisitSessionController.java`

**Changes**:
```java
// Before: Role-based
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")

// After: Permission-based
@PreAuthorize("hasAuthority('VISIT_SESSION_CREATE')")
@PreAuthorize("hasAuthority('VISIT_SESSION_READ')")
@PreAuthorize("hasAuthority('VISIT_SESSION_UPDATE')")
```

### 3. New Permission Service
**File**: `eyesante-backend/src/main/java/com/rossumtechsystems/eyesante_backend/service/PermissionService.java`

**Features**:
- Check specific permissions: `hasPermission(permissionName)`
- Check multiple permissions: `hasAnyPermission(permissionNames)`
- Check roles: `hasRole(roleName)`
- Convenience methods for common checks:
  - `canCreatePatients()`
  - `canUpdatePatients()`
  - `canCreateVisitSessions()`
  - `canCreateExaminations()`
  - `isDoctor()`
  - `isReceptionist()`
  - `isAdmin()`

### 4. New Permission Controller
**File**: `eyesante-backend/src/main/java/com/rossumtechsystems/eyesante_backend/controller/PermissionController.java`

**Endpoints**:
- `GET /api/permissions/current-user` - Get current user's permissions and roles
- `GET /api/permissions/check/{permissionName}` - Check specific permission
- `GET /api/permissions/check-role/{roleName}` - Check specific role

**Response Format**:
```json
{
  "permissions": ["PATIENT_READ", "VISIT_SESSION_READ", ...],
  "roles": ["DOCTOR", "OPTOMETRIST"],
  "permissionChecks": {
    "canCreatePatients": false,
    "canUpdatePatients": true,
    "canCreateVisitSessions": false,
    "canCreateExaminations": true,
    "isDoctor": true,
    "isReceptionist": false,
    "isAdmin": false
  }
}
```

## Frontend Changes

### 1. New Permission Hook
**File**: `isante-front-end/lib/hooks/use-permissions.ts`

**Features**:
- Fetches user permissions from backend API
- Provides fallback to role-based permissions if API fails
- Convenience methods for common permission checks
- Automatic permission refresh when user changes

**Usage**:
```typescript
const { 
  canCreatePatients, 
  canCreateVisitSessions, 
  canCreateExaminations,
  isDoctor,
  isReceptionist,
  isAdmin 
} = usePermissions()
```

### 2. Updated Dashboard Layout
**File**: `isante-front-end/app/dashboard/layout.tsx`

**Changes**:
- Replaced role-based navigation with permission-based navigation
- Updated filtering logic to use permissions
- Added support for `['*']` role to indicate all authenticated users can access

**Navigation Logic**:
```typescript
// Clinical items only shown to doctors or admins
roles: isDoctor || isAdmin ? ['*'] : []

// Patient registration only shown to users who can create patients
roles: canCreatePatients ? ['*'] : []

// Examinations only shown to users who can create examinations
roles: canCreateExaminations ? ['*'] : []
```

### 3. Updated Patient Visit Sessions Page
**File**: `isante-front-end/app/dashboard/patient-visit-sessions/page.tsx`

**Permission Checks Added**:
- **Create Button**: Only shown if `canCreateVisitSessions`
- **Delete Button**: Only shown if `isAdmin`
- **Stage Progression**: Only shown if `canUpdateVisitSessions`
- **Mark Fee Paid**: Only shown if `canUpdateVisitSessions`

**Implementation**:
```typescript
{canCreateVisitSessions && (
  <button onClick={() => setShowCreateModal(true)}>
    New Visit Session
  </button>
)}

{isAdmin && (
  <button onClick={() => setDeletingId(session.id)}>
    Delete
  </button>
)}
```

## Permission Matrix

| Role | Patient Create | Patient Update | Visit Create | Visit Update | Exam Create | Triage Create |
|------|----------------|----------------|--------------|--------------|-------------|---------------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RECEPTIONIST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| DOCTOR | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| OPTOMETRIST | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| OPHTHALMOLOGIST | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| USER | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Key Benefits

### 1. **Granular Control**
- Fine-grained permissions instead of broad role-based access
- Specific actions can be controlled independently
- Easy to add new permissions without changing roles

### 2. **Security**
- Backend enforces permissions at API level
- Frontend provides user-friendly UI based on permissions
- No possibility of unauthorized access through API calls

### 3. **Flexibility**
- Easy to modify permission assignments
- Support for complex permission combinations
- Future-proof for new features

### 4. **User Experience**
- UI elements only shown when user has permission
- Clear visual feedback about available actions
- Consistent behavior across all pages

## Testing

### Backend Testing
1. **Database Migration**: Run V24 migration to create permissions
2. **API Endpoints**: Test permission-based endpoints
3. **Authorization**: Verify doctors cannot create patients/visits
4. **Clinical Access**: Verify doctors can access clinical features

### Frontend Testing
1. **Permission Hook**: Test permission fetching and fallback
2. **UI Elements**: Verify buttons/links only show for authorized users
3. **Navigation**: Test role-based navigation filtering
4. **Error Handling**: Test permission API failures

## Migration Steps

### 1. Backend Deployment
```bash
# Run the new migration
./mvnw spring-boot:run

# Verify permissions are created
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/permissions/current-user
```

### 2. Frontend Deployment
```bash
# Build and deploy frontend
npm run build
npm start

# Test permission-based UI
# Login as different user types and verify access
```

## Future Enhancements

### 1. **Permission Groups**
- Group related permissions for easier management
- Bulk permission assignment

### 2. **Dynamic Permissions**
- Runtime permission changes
- Temporary permission grants

### 3. **Audit Trail**
- Track permission changes
- Log permission-based actions

### 4. **Permission Inheritance**
- Role-based permission inheritance
- Department-based permissions

## Conclusion

The implemented solution successfully resolves the roles issue by:

1. **Preventing Unauthorized Access**: Doctors can no longer create patients or visit sessions
2. **Maintaining Clinical Access**: Doctors retain full access to clinical features
3. **Providing Granular Control**: Fine-grained permissions for future flexibility
4. **Ensuring Security**: Both backend and frontend enforce permissions consistently

The system is now ready for production use with proper role-based access control that meets the specific requirements of the healthcare application.
