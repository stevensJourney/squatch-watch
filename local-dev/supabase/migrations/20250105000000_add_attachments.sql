-- Add photo_id column to sightings table
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS photo_id TEXT;

-- For now, we'll document the required bucket configuration:
COMMENT ON COLUMN sightings.photo_id IS 'Reference to attachment ID in local attachments table and cloud storage filename';

