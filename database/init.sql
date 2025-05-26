-- Initialize NextCRM Database
-- This script sets up initial database configurations

-- Create or update user
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'nextcrm_user'
   ) THEN
      CREATE ROLE nextcrm_user WITH LOGIN SUPERUSER PASSWORD 'nextcrm_password_2024';
   ELSE
      ALTER ROLE nextcrm_user WITH PASSWORD 'nextcrm_password_2024';
   END IF;
END
$$;

-- Create database if it doesn't exist
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'nextcrm'
   ) THEN
      CREATE DATABASE nextcrm OWNER nextcrm_user ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;
   END IF;
END
$$;

-- Connect to nextcrm
\connect nextcrm

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default timezone
SET timezone = 'UTC';

-- Grant all privileges to nextcrm_user
GRANT ALL PRIVILEGES ON DATABASE nextcrm TO nextcrm_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO nextcrm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nextcrm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nextcrm_user;

-- Allow table creation
ALTER USER nextcrm_user CREATEDB;

-- Comment
COMMENT ON DATABASE nextcrm IS 'NextCRM - Commodity Trading CRM System';
