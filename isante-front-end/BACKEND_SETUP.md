# Backend Setup Guide

## Overview
This frontend application requires a backend server running on `http://localhost:5025` to function properly. The backend should implement the API endpoints documented in `FRONTEND_API_DOCUMENTATION.md`.

## Backend Requirements

### Base URL
```
http://localhost:5025/api
```

### Required Endpoints
The backend must implement the following endpoints with pagination support:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Token refresh
- `GET /auth/test` - Test endpoint

#### Patients
- `GET /patients?page=0&size=10&sort=firstName,asc` - Get paginated patients
- `POST /patients` - Create patient
- `GET /patients/{id}` - Get patient by ID

#### Departments
- `GET /departments?page=0&size=10&sort=name,asc` - Get paginated departments
- `POST /departments` - Create department

#### Users
- `GET /user-management/users?page=0&size=10&sort=firstName,asc` - Get paginated users
- `POST /auth/create-user` - Create user

#### Roles & Permissions
- `GET /admin/roles?page=0&size=10&sort=name,asc` - Get paginated roles
- `GET /admin/permissions?page=0&size=10&sort=name,asc` - Get paginated permissions

#### Reception
- `GET /reception/patients-received-today?page=0&size=10&sort=receptionTimestamp,desc` - Get today's patients

## Pagination Response Format
All list endpoints should return data in this format:

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

## Starting the Backend

### Option 1: If you have the backend project
1. Navigate to your backend project directory
2. Install dependencies: `npm install` or `mvn install`
3. Start the server:
   - Node.js: `npm start` or `node server.js`
   - Java Spring Boot: `mvn spring-boot:run`
   - Python: `python app.py` or `flask run`
4. Ensure it's running on port 5025

### Option 2: Using Docker (if available)
```bash
docker run -p 5025:5025 your-backend-image
```

### Option 3: Mock Backend for Development
If you don't have the backend yet, you can create a simple mock server:

```bash
# Install json-server for a quick mock API
npm install -g json-server

# Create a db.json file with sample data
# Then run:
json-server --watch db.json --port 5025
```

## Testing Backend Connection

### Manual Test
```bash
curl -X GET "http://localhost:5025/api/auth/test" \
  -H "Content-Type: application/json"
```

### From Frontend
The frontend will automatically show a connection status banner when the backend is not running.

## Troubleshooting

### Backend Not Starting
1. Check if port 5025 is already in use:
   ```bash
   lsof -i :5025
   ```
2. Kill any process using the port:
   ```bash
   kill -9 <PID>
   ```

### CORS Issues
Ensure your backend has CORS configured to allow requests from `http://localhost:3000`:

```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Authentication Issues
1. Check that JWT tokens are being generated correctly
2. Verify token expiration times
3. Ensure refresh token endpoints are working

## Development Workflow

1. **Start Backend First**: Always start the backend server before the frontend
2. **Check Status**: The frontend will show a green "Backend Connected" banner when working
3. **API Testing**: Use the browser's Network tab to monitor API calls
4. **Error Handling**: Check browser console for detailed error messages

## Environment Variables

If your backend uses environment variables, ensure these are set:

```bash
# Example environment variables
export PORT=5025
export DATABASE_URL=your_database_url
export JWT_SECRET=your_jwt_secret
```

## Next Steps

Once the backend is running:
1. The frontend will automatically detect the connection
2. You can log in using the test credentials from the API documentation
3. All pagination features will work with the backend data
4. Real-time data will be displayed in the dashboard

For more details about the API endpoints, see `FRONTEND_API_DOCUMENTATION.md`. 