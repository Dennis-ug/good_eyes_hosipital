#!/bin/bash

# iSante Environment File Generator
# This script creates a .env file with all necessary environment variables

echo "🔐 Creating .env file for iSante application..."

# Create .env file with all environment variables
cat > .env << 'ENVFILE'
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://161.35.46.156:5432/eye_sante_production
SPRING_DATASOURCE_USERNAME=dennie
SPRING_DATASOURCE_PASSWORD=python@256

# JWT Configuration
APP_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-longer-than-64-bytes-for-security
APP_JWT_EXPIRATION_MILLISECONDS=86400000
APP_JWT_REFRESH_EXPIRATION_MILLISECONDS=604800000

# Mail Configuration (Mailtrap)
SPRING_MAIL_HOST=live.smtp.mailtrap.io
SPRING_MAIL_PORT=2525
SPRING_MAIL_USERNAME=api
SPRING_MAIL_PASSWORD=your-mailtrap-token-here
SPRING_MAIL_FROM=noreply@rossumtechsystems.com

# Mail SMTP Properties
SPRING_MAIL_PROPERTIES_MAIL_SMTP_CONNECTIONTIMEOUT=10000
SPRING_MAIL_PROPERTIES_MAIL_SMTP_TIMEOUT=10000
SPRING_MAIL_PROPERTIES_MAIL_SMTP_WRITETIMEOUT=10000

# Server Configuration
SERVER_PORT=5025

# CORS Configuration
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

# Server Configuration
SERVER_IP=161.35.46.156
SERVER_USER=workflow
SERVER_PASSWORD=python@256
PROJECT_PATH=/home/workflow/projects/isante_project

# pgAdmin Configuration (if needed)
PGADMIN_DEFAULT_EMAIL=admin@eyesante.com
PGADMIN_DEFAULT_PASSWORD=admin123

# Database Admin (if needed)
POSTGRES_DB=eyesante_db
POSTGRES_USER=eyesante_admin
POSTGRES_PASSWORD=eyesante_admin_password
POSTGRES_PORT=5432
ENVFILE

# Set proper permissions for .env file
chmod 600 .env

echo "✅ .env file created successfully!"
echo "📁 File location: $(pwd)/.env"
echo "🔒 File permissions: $(ls -la .env | awk '{print $1}')"
echo ""
echo "⚠️  IMPORTANT: Please update the following values in the .env file:"
echo "   - SPRING_DATASOURCE_PASSWORD (database password)"
echo "   - APP_JWT_SECRET (use a strong, unique secret)"
echo "   - SPRING_MAIL_PASSWORD (your Mailtrap token)"
echo "   - SERVER_PASSWORD (your server password)"
echo ""
echo "🔧 You can edit the file using: nano .env"
