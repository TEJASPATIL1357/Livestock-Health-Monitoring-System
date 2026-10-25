-- Module 2D Migration: Nullable Animal Tags and Device Revocation & Rotation

-- 1. Alter animals.tag_number to allow NULL values
ALTER TABLE animals ALTER COLUMN tag_number DROP NOT NULL;

-- 2. Add revocation and key rotation columns to devices table
ALTER TABLE devices ADD COLUMN revoked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE devices ADD COLUMN last_rotated_at TIMESTAMP WITH TIME ZONE;
