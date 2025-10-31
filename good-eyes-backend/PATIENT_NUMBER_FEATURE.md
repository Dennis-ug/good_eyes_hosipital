# Patient Number Feature

## Overview
The patient number feature automatically generates unique patient numbers for all new patients in the system. Patient numbers follow the format `ESP-XXXXXX` where XXXXXX is a sequential 6-digit number.

## Implementation Details

### Database Changes
- Added `patient_number` column to `patients` table
- Column is `VARCHAR(20)`, `NOT NULL`, and `UNIQUE`
- Created index for faster lookups

### Entity Changes
- Added `patientNumber` field to `Patient` entity
- Field is automatically populated during patient creation

### Service Layer
- Created `PatientNumberService` to handle patient number generation
- Updated `PatientService` to use the number generation service
- Patient numbers are generated sequentially starting from ESP-000001

### DTO Changes
- Added `patientNumber` field to `PatientDto`
- Patient numbers are included in API responses

## API Usage

### Creating a Patient
When creating a new patient, the system automatically generates a patient number:

```bash
POST /api/patients
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "nationalId": "123456789012345",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 33,
  "phone": "1234567890",
  "residence": "Kampala"
}
```

Response will include the generated patient number:
```json
{
  "id": 1,
  "patientNumber": "ESP-000001",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

### Getting Patients
Patient numbers are included in all patient retrieval endpoints:

```bash
GET /api/patients
```

Response includes patient numbers:
```json
{
  "content": [
    {
      "id": 1,
      "patientNumber": "ESP-000001",
      "firstName": "John",
      "lastName": "Doe",
      ...
    },
    {
      "id": 2,
      "patientNumber": "ESP-000002",
      "firstName": "Jane",
      "lastName": "Smith",
      ...
    }
  ]
}
```

## Automatic Sequence Initialization
The patient number sequence is automatically created when the application starts if it doesn't exist. No manual migration is required.

## Database Setup
The sequence table and function are created automatically on application startup:

- `patient_number_sequence` table stores the current sequence number
- `get_next_patient_number()` function provides atomic number generation
- Sequence starts from ESP-000001 and increments automatically

## Assigning Patient Numbers to Existing Patients
If you have existing patients without patient numbers, you can assign them using the provided endpoint:

```bash
POST /api/patients/assign-patient-numbers
```

Or use the test script:

```bash
./test-assign-patient-numbers.sh
```

## Testing
Use the provided test scripts to verify the functionality:

```bash
# Test new patient creation with auto-generated numbers
./test-patient-number.sh

# Test assigning numbers to existing patients
./test-assign-patient-numbers.sh
```

## Notes
- Patient numbers are auto-generated and cannot be manually set
- The numbering is sequential and starts from ESP-000001
- Existing patients need to have patient numbers assigned using the `/assign-patient-numbers` endpoint
- Patient numbers are unique across the entire system
- The `patient_number` column is initially nullable to handle existing data 