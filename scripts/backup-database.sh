#!/bin/bash

# Database Backup Script for iSante Backend
# This script creates backups before deployments to prevent data loss

set -e

# Configuration
BACKUP_DIR="/backups/isante"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="isante_backup_${TIMESTAMP}.sql"
COMPRESSED_BACKUP="${BACKUP_FILE}.gz"

# Database connection parameters
DB_HOST="${SPRING_DATASOURCE_URL:-jdbc:postgresql://postgres:5432/eyesante_db}"
DB_NAME="${DB_NAME:-eyesante_db}"
DB_USER="${SPRING_DATASOURCE_USERNAME:-eyesante_admin}"
DB_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-eyesante_admin_password}"

# Extract host from JDBC URL if needed
if [[ $DB_HOST == jdbc:postgresql://* ]]; then
    DB_HOST=$(echo $DB_HOST | sed 's|jdbc:postgresql://||' | sed 's|/.*||')
fi

echo "🔒 Creating database backup before deployment..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Set password for psql
export PGPASSWORD="$DB_PASSWORD"

# Create backup with data and schema
echo "📦 Creating backup: $BACKUP_FILE"
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
echo "🗜️ Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_DIR/$COMPRESSED_BACKUP" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_BACKUP" | cut -f1)
    echo "✅ Backup created successfully: $COMPRESSED_BACKUP ($BACKUP_SIZE)"
else
    echo "❌ Backup creation failed!"
    exit 1
fi

# Keep only the last 10 backups to save disk space
echo "🧹 Cleaning old backups (keeping last 10)..."
cd "$BACKUP_DIR"
ls -t *.sql.gz | tail -n +11 | xargs -r rm -f

# Create a backup verification script
cat > "$BACKUP_DIR/verify_backup.sh" << 'EOF'
#!/bin/bash
# Verify backup integrity
BACKUP_FILE="$1"
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "🔍 Verifying backup: $BACKUP_FILE"
gunzip -t "$BACKUP_FILE"
if [ $? -eq 0 ]; then
    echo "✅ Backup file is valid and not corrupted"
else
    echo "❌ Backup file is corrupted!"
    exit 1
fi
EOF

chmod +x "$BACKUP_DIR/verify_backup.sh"

echo "🔒 Database backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR/$COMPRESSED_BACKUP"
echo "🔍 To verify backup: $BACKUP_DIR/verify_backup.sh $COMPRESSED_BACKUP"
