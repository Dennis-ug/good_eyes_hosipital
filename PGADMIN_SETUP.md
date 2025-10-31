# pgAdmin Setup Guide for iSante Database

## Quick Access

- **URL**: http://localhost:5050
- **Email**: admin@eyesante.com
- **Password**: admin123

## First-Time Setup

### 1. Login to pgAdmin
1. Open your browser and go to http://localhost:5050
2. Enter the credentials:
   - Email: `admin@eyesante.com`
   - Password: `admin123`

### 2. Add Database Server
1. Right-click on "Servers" in the left sidebar
2. Select "Register" → "Server..."

### 3. Configure Server Connection

#### General Tab:
- **Name**: `Eyesante Database` (or any name you prefer)

#### Connection Tab:
- **Host name/address**: `postgres`
- **Port**: `5432`
- **Maintenance database**: `eyesante_db`
- **Username**: `eyesante_admin`
- **Password**: `eyesante_admin_password`
- **Save password**: ✅ (check this box)

### 4. Test Connection
Click "Save" and pgAdmin will connect to your database.

## What You Can Do

### Browse Database Structure
- Expand your server → Databases → eyesante_db → Schemas → public → Tables
- View table structures, indexes, and constraints

### Execute Queries
- Click the "Query Tool" button (SQL icon)
- Write and execute SQL queries
- View results in a tabular format

### Export Data
- Right-click on any table
- Select "Import/Export" to export data in various formats

### Monitor Database
- View active connections
- Check database statistics
- Monitor query performance

## Common Tables in iSante

The main tables you'll find in the database include:

- `patients` - Patient information
- `appointments` - Appointment scheduling
- `invoices` - Financial records
- `basic_refraction_exams` - Eye examination data
- `main_exams` - Main examination records
- `users` - System users
- `departments` - Hospital departments
- `inventory_items` - Stock management
- `patient_visit_sessions` - Visit tracking

## Troubleshooting

### Connection Issues
- Ensure all Docker containers are running: `docker-compose ps`
- Check pgAdmin logs: `docker-compose logs pgadmin`
- Verify database is healthy: `docker-compose logs postgres`

### Password Issues
- Default password is `admin123`
- You can change it in the docker-compose.yml file under pgAdmin environment variables

### Port Issues
- If port 5050 is already in use, change it in docker-compose.yml:
  ```yaml
  ports:
    - "5051:80"  # Change 5050 to 5051
  ```
