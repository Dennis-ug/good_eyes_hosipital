# Data Protection Guide for iSante Backend

## 🔒 Overview

This guide outlines the comprehensive data protection strategies implemented to ensure that database data is never lost when new code is pushed to production.

## 🛡️ Data Protection Strategies

### 1. **Schema Validation Only**
- **Configuration**: `ddl-auto: validate`
- **Purpose**: Prevents automatic schema changes that could cause data loss
- **Benefit**: Only allows explicit migrations to modify the database structure

### 2. **Database Migrations with Flyway**
- **Tool**: Flyway for version-controlled database changes
- **Benefits**: 
  - Version control for database changes
  - Rollback capability
  - Safe schema evolution
  - Data integrity validation

### 3. **Automatic Backup Before Deployment**
- **Trigger**: Before every deployment
- **Location**: `/backups/isante/`
- **Format**: Compressed SQL dumps
- **Retention**: Last 10 backups

### 4. **Data Protection Safeguards**
- **Triggers**: Prevent deletion of critical data
- **Functions**: Safe deletion with dependency checks
- **Constraints**: Foreign key constraints for data integrity
- **Indexes**: Performance optimization and data integrity

## 📁 Backup and Restore

### Automatic Backup
```bash
# Runs automatically before deployment
./scripts/backup-database.sh
```

### Manual Backup
```bash
# Create backup manually
./scripts/backup-database.sh
```

### Restore from Backup
```bash
# Restore from specific backup file
./scripts/restore-database.sh /backups/isante/isante_backup_20250117_143022.sql.gz
```

### Verify Backup Integrity
```bash
# Verify backup file is not corrupted
/backups/isante/verify_backup.sh isante_backup_20250117_143022.sql.gz
```

## 🔧 Configuration Files

### Production Configuration
- **File**: `application-production.yml`
- **Features**:
  - Schema validation only
  - Flyway migrations enabled
  - Data protection triggers
  - Backup before migration

### Development Configuration
- **File**: `application-dev.yml`
- **Features**:
  - Schema updates allowed
  - Full validation
  - Debug logging
  - Data.sql enabled

## 🚨 Critical Data Protection

### Protected Entities
1. **SUPER_ADMIN Role**: Cannot be deleted
2. **Critical Permissions**: USER_READ, ROLE_READ, PERMISSION_READ
3. **User Data**: Protected by foreign key constraints
4. **Role Assignments**: Protected by dependency checks

### Safe Deletion Functions
```sql
-- Safe role deletion (only if no users assigned)
SELECT safe_delete_role(role_id);

-- Safe permission deletion (only if no roles assigned)
SELECT safe_delete_permission(permission_id);
```

## 📊 Monitoring and Alerts

### Backup Monitoring
- **Location**: `/backups/isante/`
- **Size Monitoring**: Automatic cleanup of old backups
- **Integrity Checks**: Verification scripts included

### Database Health Checks
- **Foreign Key Constraints**: Ensure data integrity
- **Index Performance**: Optimized for queries
- **Migration Status**: Flyway validation

## 🚀 Deployment Process

### Pre-Deployment
1. **Automatic Backup**: Database backup created
2. **Validation**: Schema and data integrity checks
3. **Migration Check**: Flyway validates pending migrations

### During Deployment
1. **Container Restart**: Application containers restarted
2. **Migration Execution**: Flyway runs pending migrations
3. **Health Check**: Application health verified

### Post-Deployment
1. **Data Verification**: Critical data integrity confirmed
2. **Backup Verification**: New backup integrity checked
3. **Application Monitoring**: Logs and metrics reviewed

## 🔍 Troubleshooting

### Backup Issues
```bash
# Check backup directory
ls -la /backups/isante/

# Verify backup integrity
gunzip -t backup_file.sql.gz

# Check disk space
df -h /backups/
```

### Migration Issues
```bash
# Check Flyway status
docker-compose exec backend flyway info

# Check migration history
docker-compose exec backend flyway history

# Repair migrations if needed
docker-compose exec backend flyway repair
```

### Data Recovery
```bash
# List available backups
ls -la /backups/isante/*.sql.gz

# Restore from backup
./scripts/restore-database.sh backup_file.sql.gz

# Verify restore
docker-compose logs backend
```

## 📋 Best Practices

### Development
1. **Always test migrations** in development first
2. **Use Flyway migrations** for schema changes
3. **Backup before testing** major changes
4. **Validate data integrity** after changes

### Production
1. **Never modify production schema** directly
2. **Always backup** before deployments
3. **Monitor migration logs** during deployment
4. **Verify data integrity** after deployment
5. **Keep backup retention** policy enforced

### Emergency Procedures
1. **Stop deployment** if backup fails
2. **Verify backup integrity** before proceeding
3. **Have rollback plan** ready
4. **Document any manual interventions**

## 🔐 Security Considerations

### Backup Security
- **Encryption**: Backups stored securely
- **Access Control**: Limited access to backup directory
- **Network Security**: Secure transfer of backups

### Database Security
- **Connection Encryption**: TLS for database connections
- **User Permissions**: Minimal required permissions
- **Audit Logging**: Track all database changes

## 📞 Support

### Emergency Contacts
- **Database Issues**: Check logs and backup status
- **Migration Problems**: Review Flyway migration history
- **Data Loss**: Use restore script immediately

### Documentation
- **Migration Files**: `db/migration/`
- **Backup Scripts**: `scripts/`
- **Configuration**: `application-*.yml`

---

**Remember**: Data protection is critical. Always backup before making changes and verify data integrity after deployments.
