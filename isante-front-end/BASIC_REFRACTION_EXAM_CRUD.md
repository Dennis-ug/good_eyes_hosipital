### Basic Refraction Exam API – CRUD Examples

Base URL: `/api/basic-refraction-exams`
Auth: `Authorization: Bearer <JWT>`

Tip: set a token first
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')
```

---

### Create
POST `/api/basic-refraction-exams`
```bash
echo '{
  "visitSessionId": 123,
  "neuroOriented": true,
  "neuroMood": "nl",
  "pupilsPerrl": true,
  "pupilsRightDark": "4", "pupilsRightLight": "2", "pupilsRightShape": "Round", "pupilsRightReact": "Brisk", "pupilsRightApd": "None",
  "pupilsLeftDark": "4", "pupilsLeftLight": "2", "pupilsLeftShape": "Round", "pupilsLeftReact": "Brisk", "pupilsLeftApd": "None",
  "visualAcuityDistanceScRight": "6/6", "visualAcuityDistancePhRight": "6/6", "visualAcuityDistanceCcRight": "6/6",
  "visualAcuityDistanceScLeft": "6/9",  "visualAcuityDistancePhLeft": "6/6", "visualAcuityDistanceCcLeft": "6/6",
  "visualAcuityNearScRight": "N6", "visualAcuityNearCcRight": "N6",
  "visualAcuityNearScLeft": "N6",  "visualAcuityNearCcLeft": "N6",
  "manifestAutoRightSphere": -1.25, "manifestAutoRightCylinder": -0.50, "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -1.00,  "manifestAutoLeftCylinder": -0.25, "manifestAutoLeftAxis": 85,
  "keratometryK1Right": 43.50, "keratometryK2Right": 44.25, "keratometryAxisRight": 90,
  "keratometryK1Left": 43.75,  "keratometryK2Left": 44.00,  "keratometryAxisLeft": 85,
  "manifestRetRightSphere": -1.25, "manifestRetRightCylinder": -0.50, "manifestRetRightAxis": 90,
  "manifestRetLeftSphere": -1.00,  "manifestRetLeftCylinder": -0.25, "manifestRetLeftAxis": 85,
  "subjectiveRightSphere": -1.25, "subjectiveRightCylinder": -0.50, "subjectiveRightAxis": 90,
  "subjectiveLeftSphere": -1.00,  "subjectiveLeftCylinder": -0.25, "subjectiveLeftAxis": 85,
  "addedValues": "+1.50",
  "bestRightVision": "6/6", "bestLeftVision": "6/6",
  "pdRightEye": 32.0, "pdLeftEye": 32.0,
  "comment": "Base refraction completed."
}' | curl -s -X POST http://localhost:8080/api/basic-refraction-exams \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @- | jq '.'
```

Response (200)
```json
{
  "id": 1,
  "visitSessionId": 123,
  "neuroOriented": true,
  "neuroMood": "nl",
  "pupilsPerrl": true,
  "pupilsRightDark": "4", "pupilsRightLight": "2", "pupilsRightShape": "Round", "pupilsRightReact": "Brisk", "pupilsRightApd": "None",
  "pupilsLeftDark": "4", "pupilsLeftLight": "2", "pupilsLeftShape": "Round", "pupilsLeftReact": "Brisk", "pupilsLeftApd": "None",
  "visualAcuityDistanceScRight": "6/6", "visualAcuityDistancePhRight": "6/6", "visualAcuityDistanceCcRight": "6/6",
  "visualAcuityDistanceScLeft": "6/9",  "visualAcuityDistancePhLeft": "6/6", "visualAcuityDistanceCcLeft": "6/6",
  "visualAcuityNearScRight": "N6", "visualAcuityNearCcRight": "N6",
  "visualAcuityNearScLeft": "N6",  "visualAcuityNearCcLeft": "N6",
  "manifestAutoRightSphere": -1.25, "manifestAutoRightCylinder": -0.50, "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -1.00,  "manifestAutoLeftCylinder": -0.25, "manifestAutoLeftAxis": 85,
  "keratometryK1Right": 43.5, "keratometryK2Right": 44.25, "keratometryAxisRight": 90,
  "keratometryK1Left": 43.75, "keratometryK2Left": 44.0, "keratometryAxisLeft": 85,
  "manifestRetRightSphere": -1.25, "manifestRetRightCylinder": -0.50, "manifestRetRightAxis": 90,
  "manifestRetLeftSphere": -1.00,  "manifestRetLeftCylinder": -0.25, "manifestRetLeftAxis": 85,
  "subjectiveRightSphere": -1.25, "subjectiveRightCylinder": -0.50, "subjectiveRightAxis": 90,
  "subjectiveLeftSphere": -1.00,  "subjectiveLeftCylinder": -0.25, "subjectiveLeftAxis": 85,
  "addedValues": "+1.50",
  "bestRightVision": "6/6", "bestLeftVision": "6/6",
  "pdRightEye": 32.0, "pdLeftEye": 32.0,
  "comment": "Base refraction completed."
}
```

---

### Get by ID
GET `/api/basic-refraction-exams/{id}`
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/basic-refraction-exams/1 | jq '.'
```

### Get by Visit Session
GET `/api/basic-refraction-exams/visit-session/{visitSessionId}`
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/basic-refraction-exams/visit-session/123 | jq '.'
```

### List
GET `/api/basic-refraction-exams`
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/basic-refraction-exams | jq '.'
```

---

### Update
PUT `/api/basic-refraction-exams/{id}`
```bash
echo '{
  "visitSessionId": 123,
  "neuroOriented": true,
  "neuroMood": "calm",
  "pupilsPerrl": true,
  "pupilsRightDark": "4", "pupilsRightLight": "2", "pupilsRightShape": "Round", "pupilsRightReact": "Brisk", "pupilsRightApd": "None",
  "pupilsLeftDark": "4", "pupilsLeftLight": "2", "pupilsLeftShape": "Round", "pupilsLeftReact": "Brisk", "pupilsLeftApd": "None",
  "visualAcuityDistanceScRight": "6/6", "visualAcuityDistancePhRight": "6/6", "visualAcuityDistanceCcRight": "6/6",
  "visualAcuityDistanceScLeft": "6/6", "visualAcuityDistancePhLeft": "6/6", "visualAcuityDistanceCcLeft": "6/6",
  "visualAcuityNearScRight": "N6", "visualAcuityNearCcRight": "N5",
  "visualAcuityNearScLeft": "N6",  "visualAcuityNearCcLeft": "N5",
  "manifestAutoRightSphere": -1.00, "manifestAutoRightCylinder": -0.25, "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -0.75,  "manifestAutoLeftCylinder": -0.25, "manifestAutoLeftAxis": 85,
  "keratometryK1Right": 43.25, "keratometryK2Right": 44.00, "keratometryAxisRight": 90,
  "keratometryK1Left": 43.50,  "keratometryK2Left": 43.75,  "keratometryAxisLeft": 85,
  "manifestRetRightSphere": -1.00, "manifestRetRightCylinder": -0.50, "manifestRetRightAxis": 90,
  "manifestRetLeftSphere": -0.75,  "manifestRetLeftCylinder": -0.25, "manifestRetLeftAxis": 85,
  "subjectiveRightSphere": -1.00, "subjectiveRightCylinder": -0.50, "subjectiveRightAxis": 90,
  "subjectiveLeftSphere": -0.75,  "subjectiveLeftCylinder": -0.25, "subjectiveLeftAxis": 85,
  "addedValues": "+1.50",
  "bestRightVision": "6/6", "bestLeftVision": "6/6",
  "pdRightEye": 31.5, "pdLeftEye": 31.5,
  "comment": "Updated after trial lenses."
}' | curl -s -X PUT http://localhost:8080/api/basic-refraction-exams/1 \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @- | jq '.'
```

---

### Delete
DELETE `/api/basic-refraction-exams/{id}`
```bash
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/basic-refraction-exams/1 | cat
```

---

### Notes
- Required: `visitSessionId`. Other fields optional.
- Visual acuity options: Distance `6/4 … 6/60, HM, PL, NPL`; Near `N4 … N11`.
