### Main Examination API – CRUD Examples

Base URL: `/api/main-exams`
Auth: `Authorization: Bearer <JWT>`

Tip: get a token first
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')
```

---

### Create
POST `/api/main-exams`
```bash
echo '{
  "visitSessionId": 123,
  "externalRight": "Normal lids and lashes. Clear cornea.",
  "externalLeft":  "Mild blepharitis.",
  "slitLampObservations": [
    {"structure": "Lid",        "finding": "Clean, no crusting",    "eyeSide": "R"},
    {"structure": "Conjunctiva", "finding": "Mild injection",        "eyeSide": "L"},
    {"structure": "Cornea",     "finding": "Clear, no staining",    "eyeSide": "Both"}
  ],
  "cdrRight": 0.3,
  "cdrLeft": 0.3,
  "iopRight": 15,
  "iopLeft": 16,
  "advice": "Warm compresses, lid hygiene.",
  "historyComments": "Patient reports morning crusting.",
  "doctorsNotes": "Blepharitis L > R. Monitor.",
  "timeCompleted": "2025-08-12T11:45:00"
}' | curl -s -X POST http://localhost:8080/api/main-exams \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @- | jq '.'
```

Response (200)
```json
{
  "id": 1,
  "visitSessionId": 123,
  "externalRight": "Normal lids and lashes. Clear cornea.",
  "externalLeft":  "Mild blepharitis.",
  "slitLampObservations": [
    {"id": 10, "structure": "Lid", "finding": "Clean, no crusting", "eyeSide": "R"},
    {"id": 11, "structure": "Conjunctiva", "finding": "Mild injection", "eyeSide": "L"},
    {"id": 12, "structure": "Cornea", "finding": "Clear, no staining", "eyeSide": "Both"}
  ],
  "cdrRight": 0.3,
  "cdrLeft": 0.3,
  "iopRight": 15,
  "iopLeft": 16,
  "advice": "Warm compresses, lid hygiene.",
  "historyComments": "Patient reports morning crusting.",
  "doctorsNotes": "Blepharitis L > R. Monitor.",
  "timeCompleted": "2025-08-12T11:45:00"
}
```

---

### Get by ID
GET `/api/main-exams/{id}`
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/main-exams/1 | jq '.'
```

### Get by Visit Session
GET `/api/main-exams/visit-session/{visitSessionId}`
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/main-exams/visit-session/123 | jq '.'
```

---

### Update
PUT `/api/main-exams/{id}`
```bash
echo '{
  "visitSessionId": 123,
  "externalRight": "Normal external exam.",
  "externalLeft":  "Resolved blepharitis.",
  "slitLampObservations": [
    {"structure": "Conjunctiva", "finding": "Quiet",      "eyeSide": "Both"},
    {"structure": "Cornea",      "finding": "Clear",       "eyeSide": "Both"},
    {"structure": "Lens",        "finding": "NS +1",      "eyeSide": "R"}
  ],
  "cdrRight": 0.35,
  "cdrLeft": 0.35,
  "iopRight": 16,
  "iopLeft": 15,
  "advice": "Continue hygiene.",
  "historyComments": "Improved symptoms.",
  "doctorsNotes": "Stable. Review 6 months.",
  "timeCompleted": "2025-08-12T12:10:00"
}' | curl -s -X PUT http://localhost:8080/api/main-exams/1 \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @- | jq '.'
```

---

### Delete
DELETE `/api/main-exams/{id}`
```bash
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/main-exams/1 | jq '.'
```

---

### Notes
- Required: `visitSessionId`.
- `slitLampObservations` items support: `structure` (e.g., Lid/Conjunctiva/Cornea/Iris/Lens/Vitreous), `finding` (TEXT), `eyeSide` (R/L/Both).
- `cdrRight/cdrLeft` are numeric values (e.g., 0.3).
- All fields optional except `visitSessionId`.
