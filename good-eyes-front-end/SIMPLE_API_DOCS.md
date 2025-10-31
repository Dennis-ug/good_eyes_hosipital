# Simple API Documentation

## New Patient Visit Session APIs

### 1. Create Visit Session
```http
POST /api/patient-visit-sessions
```

**Request:**
```json
{
  "patientId": 123,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain",
  "consultationFeeAmount": 50.00
}
```

**Response:**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "currentStage": "CASHIER",
  "status": "INVOICE_CREATED",
  "consultationFeePaid": false,
  "invoiceId": 1
}
```

### 2. Mark Fee as Paid
```http
PUT /api/patient-visit-sessions/{id}/mark-fee-paid
```

**Request:**
```json
{
  "paymentMethod": "CASH",
  "paymentReference": "REF-123"
}
```

**Response:**
```json
{
  "id": 1,
  "currentStage": "TRIAGE",
  "status": "PAYMENT_COMPLETED",
  "consultationFeePaid": true,
  "paymentMethod": "CASH"
}
```

### 3. Progress Stage
```http
PUT /api/patient-visit-sessions/{id}/progress-stage
```

**Response:**
```json
{
  "id": 1,
  "currentStage": "DOCTOR_VISIT",
  "status": "TRIAGE_COMPLETED"
}
```

### 4. Get by ID
```http
GET /api/patient-visit-sessions/{id}
```

**Response:**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "currentStage": "TRIAGE",
  "status": "PAYMENT_COMPLETED",
  "consultationFeePaid": true
}
```

### 5. Get by Patient
```http
GET /api/patient-visit-sessions/patient/{patientId}
```

**Response:**
```json
[
  {
    "id": 1,
    "currentStage": "COMPLETED",
    "status": "COMPLETED"
  },
  {
    "id": 2,
    "currentStage": "RECEPTION",
    "status": "REGISTERED"
  }
]
```

## Error Responses

```json
{
  "status": "error",
  "message": "Patient not found with ID: 999"
}
```

```json
{
  "status": "error", 
  "message": "Visit session not found with ID: 999"
}
```

## Stages
- RECEPTION → CASHIER → TRIAGE → DOCTOR_VISIT → PHARMACY → COMPLETED

---

## Frontend Changes Required

### 1. **Patient Registration Flow**
- Update patient registration to include visit purpose selection
- Add consultation fee amount input field
- Display current stage prominently on visit session cards
- Show stage progression indicators (progress bar or timeline)

### 2. **Dashboard Updates**
- Add visit session management section
- Display current stage for each patient
- Show payment status and invoice information
- Add filters for different stages and statuses
- Include stage-based action buttons

### 3. **Payment Processing**
- Create payment form for consultation fees
- Add payment method selection (CASH, MOBILE_MONEY, etc.)
- Display invoice details and payment status
- Show payment confirmation and stage progression

### 4. **Stage Management**
- Add stage progression buttons for staff
- Display stage-specific forms and actions
- Show stage completion requirements
- Add stage transition confirmations

### 5. **Reception Interface**
- Create visit session creation form
- Add patient search and selection
- Include visit purpose and complaint fields
- Show automatic invoice creation status

### 6. **Cashier Interface**
- Display pending payments for consultation fees
- Add payment processing forms
- Show payment confirmation and stage updates
- Include payment history and receipts

### 7. **Triage Interface**
- Show patients in triage stage
- Add triage measurement forms
- Display stage completion options
- Include measurement history

### 8. **Doctor Interface**
- Display patients in doctor visit stage
- Add examination forms and notes
- Show stage progression options
- Include patient history and previous visits

### 9. **Pharmacy Interface**
- Show patients in pharmacy stage
- Add medication dispensing forms
- Display prescription details
- Include medication history

### 10. **Reporting and Analytics**
- Add stage duration tracking
- Display workflow analytics
- Show bottleneck identification
- Include performance metrics

### 11. **Notifications**
- Add stage change notifications
- Display payment confirmations
- Show completion alerts
- Include reminder notifications

### 12. **User Role Updates**
- Update role-based access controls
- Add stage-specific permissions
- Display role-appropriate interfaces
- Include action authorization

### 13. **Data Display**
- Update patient visit history
- Show stage progression timeline
- Display payment and invoice details
- Include audit trail information

### 14. **Form Updates**
- Add visit session creation forms
- Update patient registration forms
- Include payment processing forms
- Add stage-specific input fields

### 15. **Navigation Updates**
- Add visit session management menu
- Update patient dashboard navigation
- Include stage-based filtering
- Add quick action buttons

### 16. **State Management**
- Add visit session state management
- Update patient data structures
- Include stage progression logic
- Add payment status tracking

### 17. **API Integration**
- Update API calls for new endpoints
- Add error handling for new responses
- Include authentication for new routes
- Add request/response validation

### 18. **UI/UX Improvements**
- Add stage-based color coding
- Include progress indicators
- Display status badges
- Add loading states for stage transitions

### 19. **Mobile Responsiveness**
- Ensure stage management works on mobile
- Add touch-friendly stage progression
- Include mobile payment processing
- Display responsive stage indicators

### 20. **Testing Requirements**
- Add unit tests for new functionality
- Include integration tests for API calls
- Add end-to-end workflow tests
- Include stage progression testing 