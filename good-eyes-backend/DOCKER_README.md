# Docker Setup for Eyesante Backend

This document describes how to run the Eyesante Backend application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 2. Check Service Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f postgres
```

### 3. Access the Application

- **Application**: http://localhost:5025
- **Database**: localhost:5432 (postgres/eyesante_db)

## Services

### 1. Spring Boot Application (`app`)
- **Port**: 5025
- **Image**: Built from local Dockerfile
- **Health Check**: http://localhost:5025/api/auth/test

### 2. PostgreSQL Database (`postgres`)
- **Port**: 5432
- **Database**: eyesante_db
- **Username**: postgres
- **Password**: password
- **Health Check**: Database connectivity

## Docker Commands

### Development

```bash
# Start services in development mode
docker-compose up

# Rebuild and start
docker-compose up --build

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Execute commands in running container
docker-compose exec app sh
docker-compose exec postgres psql -U postgres -d eyesante_db
```

### Production

```bash
# Start services in production mode (without override)
docker-compose -f docker-compose.yml up -d

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all --volumes --remove-orphans
```

## Environment Variables

### Application Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:postgresql://postgres:5432/eyesante_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `password` |
| `APP_JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-change-this-in-production` |
| `APP_JWT_EXPIRATION_MILLISECONDS` | JWT expiration time | `86400000` (24 hours) |

### Database Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `eyesante_db` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `password` |

## Volumes

### Persistent Data

- `postgres_data`: PostgreSQL data directory
- `postgres-logs`: PostgreSQL log files (development)
- `logs`: Application logs (development)

### Database Initialization

The `init.sql` script runs automatically when the PostgreSQL container starts for the first time. You can modify this script to:

- Create additional schemas
- Insert initial data
- Set up database extensions
- Configure permissions

## Networking

All services are connected through the `eyesante-network` bridge network, allowing them to communicate using service names as hostnames.

## Health Checks

### Application Health Check
- **Endpoint**: http://localhost:5025/api/auth/test
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

### Database Health Check
- **Command**: `pg_isready -U postgres -d eyesante_db`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5025
   lsof -i :5432
   
   # Stop conflicting services
   docker-compose down
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres psql -U postgres -d eyesante_db
   ```

3. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Rebuild application
   docker-compose build app
   docker-compose up app
   ```

4. **Permission Issues**
   ```bash
   # Fix volume permissions
   sudo chown -R 1001:1001 ./logs
   sudo chown -R 999:999 ./postgres-data
   ```

### Debugging

```bash
# Access application container
docker-compose exec app sh

# Access database container
docker-compose exec postgres psql -U postgres -d eyesante_db

# View real-time logs
docker-compose logs -f

# Check container resources
docker stats
```

## Production Deployment

For production deployment:

1. **Update JWT Secret**: Change `APP_JWT_SECRET` to a strong, unique value
2. **Use Environment Files**: Create `.env` files for different environments
3. **Configure Logging**: Set appropriate log levels
4. **Set Up Monitoring**: Configure health checks and monitoring
5. **Use Secrets Management**: Store sensitive data securely
6. **Configure Backup**: Set up database backup strategies

## Development Workflow

1. **Start Services**: `docker-compose up`
2. **Make Changes**: Edit source code
3. **Rebuild**: `docker-compose build app`
4. **Restart**: `docker-compose restart app`
5. **Test**: Access http://localhost:5025

## API Testing

Once the application is running, you can test the JWT endpoints:

```bash
# Test public endpoint
curl http://localhost:5025/api/auth/test

# Register a user
curl -X POST http://localhost:5025/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
``` 