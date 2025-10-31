# API Integration Examples

## Authentication Example

```typescript
// Login function
const login = async (username: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};
```

## Patient Management Example

```typescript
// Create patient
const createPatient = async (patientData) => {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(patientData)
  });
  
  return response.json();
};

// Get all patients
const getPatients = async () => {
  const response = await fetch('/api/patients', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};
```

## Visit Session Example

```typescript
// Create visit session
const createVisitSession = async (visitData) => {
  const response = await fetch('/api/patient-visit-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(visitData)
  });
  
  return response.json();
};

// Progress to next stage
const progressStage = async (visitSessionId) => {
  const response = await fetch(`/api/patient-visit-sessions/${visitSessionId}/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};
```

## Triage Measurement Example

```typescript
// Create triage measurement
const createTriage = async (triageData) => {
  const response = await fetch('/api/triage-measurements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(triageData)
  });
  
  return response.json();
};

// Get triage by visit session
const getTriageByVisitSession = async (visitSessionId) => {
  const response = await fetch(`/api/triage-measurements/visit-session/${visitSessionId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};
```

## Basic Refraction Exam Example

```typescript
// Create basic refraction exam
const createBasicRefraction = async (examData) => {
  const response = await fetch('/api/basic-refraction-exams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(examData)
  });
  
  return response.json();
};

// Get exam by visit session
const getBasicRefractionByVisitSession = async (visitSessionId) => {
  const response = await fetch(`/api/basic-refraction-exams/visit-session/${visitSessionId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};
```

## Complete Workflow Example

```typescript
// Complete patient visit workflow
const completePatientVisit = async () => {
  // 1. Create patient
  const patient = await createPatient({
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    nationalId: '123456789012345',
    dateOfBirth: '1990-01-01',
    ageInYears: 33,
    phone: '1234567890',
    residence: 'Nairobi, Kenya'
  });

  // 2. Create visit session
  const visitSession = await createVisitSession({
    patientId: patient.id,
    visitPurpose: 'CONSULTATION',
    consultationFee: 50.00
  });

  // 3. Mark payment as completed
  await fetch(`/api/patient-visit-sessions/${visitSession.id}/mark-paid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      paymentMethod: 'CASH',
      paymentReference: 'PAYREF123'
    })
  });

  // 4. Progress to triage
  await progressStage(visitSession.id);

  // 5. Create triage measurement
  const triage = await createTriage({
    visitSessionId: visitSession.id,
    systolicBp: 120,
    diastolicBp: 80,
    rbsValue: 95.5,
    iopRight: 16,
    iopLeft: 16,
    weightKg: 70.5,
    notes: 'Patient stable'
  });

  // 6. Progress to basic refraction exam
  await progressStage(visitSession.id);

  // 7. Create basic refraction exam
  const refraction = await createBasicRefraction({
    visitSessionId: visitSession.id,
    neuroOriented: true,
    neuroMood: 'Alert and cooperative',
    pupilsPerrl: true,
    visualAcuityDistanceScRight: '20/25',
    visualAcuityDistanceScLeft: '20/30',
    manifestAutoRightSphere: -1.50,
    manifestAutoRightCylinder: -0.75,
    manifestAutoRightAxis: 90,
    comment: 'Patient shows moderate myopia with astigmatism'
  });

  // 8. Progress to doctor visit
  await progressStage(visitSession.id);

  console.log('Patient visit workflow completed successfully!');
  return { patient, visitSession, triage, refraction };
};
```

## React Hook Example

```typescript
// Custom hook for API calls
import { useState, useEffect } from 'react';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};

// Usage
const PatientList = () => {
  const { data: patients, loading, error } = useApi('/api/patients');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>
          {patient.firstName} {patient.lastName} - {patient.patientNumber}
        </div>
      ))}
    </div>
  );
};
```

## Error Handling Example

```typescript
// Error handling utility
const handleApiError = (error) => {
  if (error.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Forbidden - show access denied
    alert('Access denied. You do not have permission to perform this action.');
  } else if (error.status === 404) {
    // Not found
    alert('Resource not found.');
  } else if (error.status >= 500) {
    // Server error
    alert('Server error. Please try again later.');
  } else {
    // Other errors
    alert(`Error: ${error.message}`);
  }
};

// Usage in API calls
const safeApiCall = async (apiFunction) => {
  try {
    return await apiFunction();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
```
