#!/bin/bash

# Database Restore Script for iSante Backend
# This script restores data from backup in case of data loss

set -e

# Configuration
BACKUP_DIR="/backups/isante"
DB_HOST="${SPRING_DATASOURCE_URL:-jdbc:postgresql://postgres:5432/eyesante_db}"
DB_NAME="${DB_NAME:-eyesante_db}"
DB_USER="${SPRING_DATASOURCE_USERNAME:-eyesante_admin}"
DB_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-eyesante_admin_password}"

# Extract host from JDBC URL if needed
if [[ $DB_HOST == jdbc:postgresql://* ]]; then
    DB_HOST=$(echo $DB_HOST | sed 's|jdbc:postgresql://||' | sed 's|/.*||')
fi

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup_file>"
    echo "📁 Available backups:"
    ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found in $BACKUP_DIR"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
echo "📁 Restoring from: $BACKUP_FILE"
echo "🗄️  Database: $DB_NAME"
echo ""

# Ask for confirmation
read -p "Are you sure you want to proceed? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

echo "🔄 Starting database restore..."

# Set password for psql
export PGPASSWORD="$DB_PASSWORD"

# Stop the application to prevent data corruption
echo "🛑 Stopping application..."
docker-compose down || echo "Application already stopped"

# Wait a moment for connections to close
sleep 5

# Restore the database
echo "📦 Restoring database..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Compressed backup
    gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --verbose
else
    # Uncompressed backup
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --verbose < "$BACKUP_FILE"
fi

# Verify restore
echo "🔍 Verifying restore..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as user_count FROM users;" || echo "Warning: Could not verify users table"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as role_count FROM roles;" || echo "Warning: Could not verify roles table"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as permission_count FROM permissions;" || echo "Warning: Could not verify permissions table"

echo "✅ Database restore completed successfully!"

# Restart the application
echo "🚀 Restarting application..."
docker-compose up -d

echo "🎉 Database restore and application restart completed!"
echo "📊 Check the application logs to ensure everything is working correctly"
