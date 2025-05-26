-- Initialize NextCRM Database
-- This script sets up initial database configurations

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

-- Make sure user can create tables
ALTER USER nextcrm_user CREATEDB;

COMMENT ON DATABASE nextcrm IS 'NextCRM - Commodity Trading CRM System';