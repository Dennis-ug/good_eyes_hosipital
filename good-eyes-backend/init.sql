-- Initialize the eyesante_db database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (PostgreSQL creates it automatically from environment variables)
-- SELECT 'CREATE DATABASE eyesante_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'eyesante_db')\gexec

-- Connect to the database
\c eyesante_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS public;

-- Grant necessary permissions to eyesante_admin user
GRANT ALL PRIVILEGES ON DATABASE eyesante_db TO eyesante_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO eyesante_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eyesante_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eyesante_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO eyesante_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO eyesante_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO eyesante_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO eyesante_admin;

-- You can add any initial data here if needed
-- For example, creating an admin user:
-- INSERT INTO users (username, email, password, first_name, last_name, role, enabled) 
-- VALUES ('admin', 'admin@eyesante.com', '$2a$10$...', 'Admin', 'User', 'ADMIN', true)
-- ON CONFLICT (username) DO NOTHING;

-- Log the initialization
SELECT 'Database initialization completed successfully' as status; 