# iSante Healthcare System - Docker Setup

This document provides instructions for running the complete iSante Healthcare System using Docker Compose.

## System Overview

The iSante Healthcare System consists of four main components:

1. **PostgreSQL Database** - Stores all application data
2. **Spring Boot Backend** - REST API server (Java)
3. **Next.js Frontend** - Web application (React/TypeScript)
4. **pgAdmin** - Database management interface

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd isante
```

### 2. Start All Services

```bash
docker-compose up -d
```

This command will:
- Build the backend and frontend applications
- Start PostgreSQL database
- Start the Spring Boot backend API
- Start the Next.js frontend application
- Set up proper networking between services

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5025
- **pgAdmin (Database Management)**: http://localhost:5050
  - Email: admin@eyesante.com
  - Password: admin123
- **Database**: localhost:5432 (username: eyesante_admin, password: eyesante_admin_password)

## Service Details

### PostgreSQL Database
- **Port**: 5432
- **Database**: eyesante_db
- **Username**: eyesante_admin
- **Password**: eyesante_admin_password
- **Data Persistence**: Yes (stored in Docker volume)

### Spring Boot Backend
- **Port**: 5025
- **Health Check**: http://localhost:5025/api/auth/test
- **API Documentation**: Available at backend endpoints
- **JWT Secret**: Configured for development (change in production)

### Next.js Frontend
- **Port**: 3000
- **Health Check**: http://localhost:3000/api/health
- **Backend URL**: Automatically configured to connect to backend service

### pgAdmin Database Management
- **Port**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@eyesante.com
- **Password**: admin123
- **Features**: Database browsing, query execution, table management

## Useful Commands

### View Running Services
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs pgadmin

# Follow logs in real-time
docker-compose logs -f
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh

# Database container
docker-compose exec postgres psql -U eyesante_admin -d eyesante_db

# pgAdmin container
docker-compose exec pgadmin sh
```

## Health Checks

All services include health checks to ensure they're running properly:

- **PostgreSQL**: Checks database connectivity
- **Backend**: Checks API endpoint availability
- **Frontend**: Checks web application availability
- **pgAdmin**: Checks web interface availability

## Database Management with pgAdmin

### Initial Setup

1. **Access pgAdmin**: Navigate to http://localhost:5050
2. **Login**: Use email `admin@eyesante.com` and password `admin123`
3. **Add Server**: Right-click on "Servers" → "Register" → "Server..."

### Server Configuration

When adding the PostgreSQL server, use these settings:

- **General Tab**:
  - Name: `Eyesante Database`
- **Connection Tab**:
  - Host name/address: `postgres`
  - Port: `5432`
  - Maintenance database: `eyesante_db`
  - Username: `eyesante_admin`
  - Password: `eyesante_admin_password`

### Features Available

- **Browse Tables**: View all database tables and their structure
- **Execute Queries**: Run SQL queries directly in the browser
- **Data Export**: Export data in various formats (CSV, JSON, etc.)
- **Schema Management**: View and modify database schema
- **User Management**: Manage database users and permissions

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :5025
   lsof -i :5432
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Backend Build Failures**
   ```bash
   # Clean and rebuild
   docker-compose down
   docker-compose up -d --build backend
   ```

4. **Frontend Build Failures**
   ```bash
   # Clean and rebuild
   docker-compose down
   docker-compose up -d --build frontend
   ```

### Memory Issues

If you encounter memory issues during build:

```bash
# Increase Docker memory limit in Docker Desktop settings
# Recommended: 4GB minimum, 8GB preferred

# Or build services individually
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend
```

### Database Reset

To reset the database (WARNING: This will delete all data):

```bash
docker-compose down -v
docker-compose up -d
```

## Development Workflow

### Making Code Changes

1. Make changes to your code
2. Rebuild the affected service:
   ```bash
   docker-compose up -d --build backend    # For backend changes
   docker-compose up -d --build frontend   # For frontend changes
   ```

### Environment Variables

To modify environment variables, edit the `docker-compose.yml` file:

- **Database**: Modify the `postgres` service environment variables
- **Backend**: Modify the `backend` service environment variables
- **Frontend**: Modify the `frontend` service environment variables

### Adding New Services

To add new services to the stack:

1. Add the service definition to `docker-compose.yml`
2. Include it in the `eyesante-network` network
3. Set up proper dependencies using `depends_on`

## Production Considerations

For production deployment:

1. **Change Default Passwords**: Update all default passwords in `docker-compose.yml`
2. **Use Environment Files**: Move sensitive data to `.env` files
3. **Configure SSL/TLS**: Set up proper SSL certificates
4. **Database Backup**: Implement regular database backup procedures
5. **Monitoring**: Add monitoring and logging solutions
6. **Resource Limits**: Set appropriate resource limits for containers

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review service logs using `docker-compose logs`
3. Ensure all prerequisites are met
4. Verify Docker Desktop is running properly

## File Structure

```
isante/
├── docker-compose.yml          # Main Docker Compose file
├── DOCKER_README.md           # This file
├── eyesante-backend/          # Spring Boot backend
│   ├── Dockerfile
│   ├── src/
│   └── ...
└── isante-front-end/          # Next.js frontend
    ├── Dockerfile
    ├── app/
    └── ...
```
