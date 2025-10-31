# Docker Setup for Eyesante Frontend

This document provides instructions for running the Eyesante frontend application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Production Build

1. **Build and run the production application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - With Nginx (if enabled): http://localhost:80 (redirects to HTTPS)

### Development Build

1. **Build and run the development application:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - With Nginx: http://localhost:8080

## Docker Commands

### Production Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f frontend

# Rebuild and restart
docker-compose up --build --force-recreate

# Clean up everything
docker-compose down -v --remove-orphans
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Start with Nginx
docker-compose -f docker-compose.dev.yml --profile nginx up --build

# Hot reload (changes are reflected immediately)
docker-compose -f docker-compose.dev.yml up

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Individual Docker Commands

```bash
# Build production image
docker build -t eyesante-frontend .

# Build development image
docker build -f Dockerfile.dev -t eyesante-frontend:dev .

# Run production container
docker run -p 3000:3000 eyesante-frontend

# Run development container
docker run -p 3000:3000 -v $(pwd):/app eyesante-frontend:dev
```

## Environment Variables

### Production Environment

The following environment variables can be set in the `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
  - API_BASE_URL=http://your-backend-api:port
```

### Development Environment

```yaml
environment:
  - NODE_ENV=development
  - NEXT_TELEMETRY_DISABLED=1
  - API_BASE_URL=http://localhost:5025
```

## SSL Configuration (Production)

For production deployment with SSL:

1. **Create SSL directory:**
   ```bash
   mkdir ssl
   ```

2. **Add your SSL certificates:**
   - `ssl/cert.pem` - SSL certificate
   - `ssl/key.pem` - Private key

3. **Run with production profile:**
   ```bash
   docker-compose --profile production up --build
   ```

## Nginx Configuration

### Production Nginx

The production Nginx configuration includes:
- SSL/TLS termination
- Rate limiting
- Security headers
- Gzip compression
- Static file caching
- Health checks

### Development Nginx

The development Nginx configuration includes:
- Basic reverse proxy
- Security headers
- Gzip compression
- Static file caching

## Health Checks

The application includes health checks:

```bash
# Check application health
curl http://localhost:3000/health

# Check Nginx health
curl http://localhost:80/health
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Build fails:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Container won't start:**
   ```bash
   # Check container logs
   docker-compose logs frontend
   
   # Check container status
   docker-compose ps
   ```

### Debugging

```bash
# Enter running container
docker-compose exec frontend sh

# View real-time logs
docker-compose logs -f

# Check container resources
docker stats
```

## Performance Optimization

### Production Optimizations

1. **Multi-stage builds** - Reduces final image size
2. **Standalone output** - Optimized for containerization
3. **Nginx caching** - Static files cached for 1 year
4. **Gzip compression** - Reduces bandwidth usage
5. **Security headers** - Enhanced security

### Development Optimizations

1. **Volume mounting** - Hot reloading enabled
2. **Node modules caching** - Faster rebuilds
3. **Source maps** - Better debugging experience

## Security Considerations

### Production Security

- Non-root user in container
- Security headers in Nginx
- Rate limiting on API endpoints
- SSL/TLS encryption
- Input validation and sanitization

### Development Security

- Basic security headers
- No sensitive data in development images
- Isolated network for development

## Monitoring and Logging

### Logs

```bash
# View application logs
docker-compose logs frontend

# View Nginx logs
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

### Metrics

The application exposes health check endpoints for monitoring:

- `/health` - Application health
- `/api/health` - API health (if implemented)

## Deployment

### Local Deployment

```bash
# Production deployment
docker-compose up -d

# Development deployment
docker-compose -f docker-compose.dev.yml up -d
```

### Cloud Deployment

1. **Build and push image:**
   ```bash
   docker build -t your-registry/eyesante-frontend:latest .
   docker push your-registry/eyesante-frontend:latest
   ```

2. **Deploy with docker-compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## File Structure

```
.
├── Dockerfile              # Production Dockerfile
├── Dockerfile.dev          # Development Dockerfile
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── nginx.conf              # Production Nginx config
├── nginx.dev.conf          # Development Nginx config
├── .dockerignore           # Docker ignore file
└── DOCKER.md               # This file
```

## Support

For issues related to Docker setup:

1. Check the troubleshooting section
2. Review Docker and docker-compose logs
3. Ensure all prerequisites are met
4. Verify environment variables are set correctly 