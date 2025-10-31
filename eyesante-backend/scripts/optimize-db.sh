#!/bin/bash

# Database Optimization Script for iSante Backend
# This script optimizes database initialization and migration performance

echo "🔧 Optimizing database initialization..."

# Set PostgreSQL optimization parameters
export PGPASSWORD=$SPRING_DATASOURCE_PASSWORD

# Optimize PostgreSQL settings for faster initialization
psql -h $DB_HOST -U $SPRING_DATASOURCE_USERNAME -d $DB_NAME << EOF
-- Optimize PostgreSQL for faster initialization
SET synchronous_commit = off;
SET fsync = off;
SET full_page_writes = off;
SET wal_buffers = '16MB';
SET checkpoint_segments = 32;
SET checkpoint_completion_target = 0.9;
SET random_page_cost = 1.1;
SET effective_cache_size = '256MB';
SET work_mem = '4MB';
SET maintenance_work_mem = '64MB';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Analyze tables for better query planning
ANALYZE roles;
ANALYZE permissions;
ANALYZE users;
ANALYZE user_roles;
ANALYZE role_permissions;

-- Reset to safe settings after initialization
SET synchronous_commit = on;
SET fsync = on;
SET full_page_writes = on;
EOF

echo "✅ Database optimization completed!"
