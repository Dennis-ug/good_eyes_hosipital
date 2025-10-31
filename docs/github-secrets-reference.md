# GitHub Secrets Reference Guide

This document provides a complete reference for all GitHub Secrets required for the iSante application deployment.

## Overview

The iSante application requires **32 GitHub Secrets** to be configured for production deployment. These secrets are used to create a `.env` file on the production server, which is then used by Docker Compose to configure the application containers.

## Secret Categories

### 1. Server Connection Secrets (4)
### 2. Database Configuration (3)
### 3. JWT Configuration (3)
### 4. Mail Configuration (8)
### 5. Server & CORS Configuration (5)
### 6. Frontend Configuration (4)
### 7. Production URLs (2)
### 8. Optional Configuration (6)

---

## 1. Server Connection Secrets

These secrets are used to connect to the production server via SSH.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `SERVER_IP` | Production server IP address | `161.35.46.156` | ✅ |
| `SERVER_USER` | SSH username for server access | `workflow` | ✅ |
| `SERVER_PASSWORD` | SSH password for server access | `your-secure-server-password` | ✅ |
| `PROJECT_PATH` | Path to project directory on server | `/home/workflow/projects/isante_project` | ✅ |

---

## 2. Database Configuration

These secrets configure the PostgreSQL database connection.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:postgresql://161.35.46.156:5432/eye_sante_production` | ✅ |
| `SPRING_DATASOURCE_USERNAME` | Database username | `dennie` | ✅ |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `your-secure-database-password` | ✅ |

---

## 3. JWT Configuration

These secrets configure JWT token authentication and expiration.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `APP_JWT_SECRET` | Secret key for JWT token signing (at least 64 bytes) | `your-super-secret-jwt-key-change-this-in-production-make-it-longer-than-64-bytes-for-security` | ✅ |
| `APP_JWT_EXPIRATION_MILLISECONDS` | JWT token expiration time in milliseconds | `86400000` (24 hours) | ✅ |
| `APP_JWT_REFRESH_EXPIRATION_MILLISECONDS` | JWT refresh token expiration time in milliseconds | `604800000` (7 days) | ✅ |

---

## 4. Mail Configuration

These secrets configure email functionality using Mailtrap or other SMTP services.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `SPRING_MAIL_HOST` | SMTP host server | `live.smtp.mailtrap.io` | ✅ |
| `SPRING_MAIL_PORT` | SMTP port number | `2525` | ✅ |
| `SPRING_MAIL_USERNAME` | SMTP username | `api` | ✅ |
| `SPRING_MAIL_PASSWORD` | SMTP password/token | `your-mailtrap-token` | ✅ |
| `SPRING_MAIL_FROM` | From email address | `noreply@rossumtechsystems.com` | ✅ |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_CONNECTIONTIMEOUT` | Connection timeout in milliseconds | `10000` | ✅ |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_TIMEOUT` | Read timeout in milliseconds | `10000` | ✅ |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_WRITETIMEOUT` | Write timeout in milliseconds | `10000` | ✅ |

---

## 5. Server & CORS Configuration

These secrets configure the backend server and CORS settings.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `SERVER_PORT` | Backend server port | `5025` | ✅ |
| `SPRING_CORS_ALLOWED_ORIGINS` | Allowed origins for CORS | `https://isante-demo.rossumtechsystems.com,http://localhost:3000,http://localhost:3001` | ✅ |
| `SPRING_CORS_ALLOWED_METHODS` | Allowed HTTP methods | `GET,POST,PUT,DELETE,OPTIONS,PATCH` | ✅ |
| `SPRING_CORS_ALLOWED_HEADERS` | Allowed headers | `*` | ✅ |
| `SPRING_CORS_ALLOW_CREDENTIALS` | Allow credentials flag | `true` | ✅ |

---

## 6. Frontend Configuration

These secrets configure the Next.js frontend application.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | Public backend URL for frontend | `https://isante-api.rossumtechsystems.com/api` | ✅ |
| `BACKEND_URL` | Backend URL for server-side operations | `https://isante-api.rossumtechsystems.com/api` | ✅ |
| `NODE_ENV` | Node.js environment | `production` | ✅ |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` | ✅ |

---

## 7. Production URLs

These secrets define the production URLs for the application.

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `PRODUCTION_BACKEND_URL` | Production backend API URL | `https://isante-api.rossumtechsystems.com/api` | ✅ |
| `PRODUCTION_FRONTEND_URL` | Production frontend URL | `https://isante-demo.rossumtechsystems.com` | ✅ |

---

## 8. Optional Configuration

These secrets are optional and only needed if using pgAdmin or managing PostgreSQL directly.

### pgAdmin Configuration

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin admin email | `admin@eyesante.com` | ❌ |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin admin password | `admin123` | ❌ |

### Database Admin Configuration

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `POSTGRES_DB` | PostgreSQL database name | `eyesante_db` | ❌ |
| `POSTGRES_USER` | PostgreSQL admin user | `eyesante_admin` | ❌ |
| `POSTGRES_PASSWORD` | PostgreSQL admin password | `eyesante_admin_password` | ❌ |
| `POSTGRES_PORT` | PostgreSQL port | `5432` | ❌ |

---

## Complete Secret List

Here's a complete list of all secrets in one place for easy copy-paste:

```bash
# Server Connection (4)
SERVER_IP
SERVER_USER
SERVER_PASSWORD
PROJECT_PATH

# Database Configuration (3)
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD

# JWT Configuration (3)
APP_JWT_SECRET
APP_JWT_EXPIRATION_MILLISECONDS
APP_JWT_REFRESH_EXPIRATION_MILLISECONDS

# Mail Configuration (8)
SPRING_MAIL_HOST
SPRING_MAIL_PORT
SPRING_MAIL_USERNAME
SPRING_MAIL_PASSWORD
SPRING_MAIL_FROM
SPRING_MAIL_PROPERTIES_MAIL_SMTP_CONNECTIONTIMEOUT
SPRING_MAIL_PROPERTIES_MAIL_SMTP_TIMEOUT
SPRING_MAIL_PROPERTIES_MAIL_SMTP_WRITETIMEOUT

# Server & CORS Configuration (5)
SERVER_PORT
SPRING_CORS_ALLOWED_ORIGINS
SPRING_CORS_ALLOWED_METHODS
SPRING_CORS_ALLOWED_HEADERS
SPRING_CORS_ALLOW_CREDENTIALS

# Frontend Configuration (4)
NEXT_PUBLIC_BACKEND_URL
BACKEND_URL
NODE_ENV
NEXT_TELEMETRY_DISABLED

# Production URLs (2)
PRODUCTION_BACKEND_URL
PRODUCTION_FRONTEND_URL

# Optional: pgAdmin Configuration (2)
PGADMIN_DEFAULT_EMAIL
PGADMIN_DEFAULT_PASSWORD

# Optional: Database Admin Configuration (4)
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_PORT
```

---

## Example Values for Production

Here are example values you can use as a starting point for production:

```bash
# Server Connection
SERVER_IP=161.35.46.156
SERVER_USER=workflow
SERVER_PASSWORD=your-secure-server-password
PROJECT_PATH=/home/workflow/projects/isante_project

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://161.35.46.156:5432/eye_sante_production
SPRING_DATASOURCE_USERNAME=dennie
SPRING_DATASOURCE_PASSWORD=your-secure-database-password

# JWT Configuration
APP_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-longer-than-64-bytes-for-security
APP_JWT_EXPIRATION_MILLISECONDS=86400000
APP_JWT_REFRESH_EXPIRATION_MILLISECONDS=604800000

# Mail Configuration (Mailtrap)
SPRING_MAIL_HOST=live.smtp.mailtrap.io
SPRING_MAIL_PORT=2525
SPRING_MAIL_USERNAME=api
SPRING_MAIL_PASSWORD=your-mailtrap-token
SPRING_MAIL_FROM=noreply@rossumtechsystems.com
SPRING_MAIL_PROPERTIES_MAIL_SMTP_CONNECTIONTIMEOUT=10000
SPRING_MAIL_PROPERTIES_MAIL_SMTP_TIMEOUT=10000
SPRING_MAIL_PROPERTIES_MAIL_SMTP_WRITETIMEOUT=10000

# Server & CORS Configuration
SERVER_PORT=5025
SPRING_CORS_ALLOWED_ORIGINS=https://isante-demo.rossumtechsystems.com,http://localhost:3000,http://localhost:3001
SPRING_CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
SPRING_CORS_ALLOWED_HEADERS=*
SPRING_CORS_ALLOW_CREDENTIALS=true

# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=https://isante-api.rossumtechsystems.com/api
BACKEND_URL=https://isante-api.rossumtechsystems.com/api
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Production URLs
PRODUCTION_BACKEND_URL=https://isante-api.rossumtechsystems.com/api
PRODUCTION_FRONTEND_URL=https://isante-demo.rossumtechsystems.com

# Optional: pgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@eyesante.com
PGADMIN_DEFAULT_PASSWORD=admin123

# Optional: Database Admin Configuration
POSTGRES_DB=eyesante_db
POSTGRES_USER=eyesante_admin
POSTGRES_PASSWORD=eyesante_admin_password
POSTGRES_PORT=5432
```

---

## Security Best Practices

1. **Use Strong Passwords**: Ensure all passwords are strong and unique
2. **Rotate Secrets Regularly**: Update secrets periodically for security
3. **Limit Access**: Only grant access to secrets to necessary team members
4. **Monitor Usage**: Regularly check secret usage and access logs
5. **Backup Secrets**: Keep a secure backup of all secret values
6. **Use Environment-Specific Values**: Use different values for development, staging, and production

---

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value as listed above
5. Repeat for all 32 secrets

---

## Verification

After setting up all secrets:

1. Push a change to the `main` branch
2. Check the GitHub Actions tab to ensure the deployment workflow runs successfully
3. Verify that all services are running on your production server
4. Test the application functionality

---

## Troubleshooting

### Common Issues

1. **Deployment Fails**: Check that all required secrets are set
2. **Database Connection Errors**: Verify database credentials and network access
3. **Email Not Working**: Check SMTP credentials and network connectivity
4. **CORS Errors**: Verify CORS configuration matches your domain

### Getting Help

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secret names match exactly (case-sensitive)
3. Ensure all secret values are correct and properly formatted
4. Contact the development team for additional support

---

## Summary

- **Total Secrets Required**: 32
- **Required Secrets**: 26
- **Optional Secrets**: 6
- **Categories**: 8

This reference guide should help you configure all the necessary GitHub Secrets for successful production deployment of the iSante application.
