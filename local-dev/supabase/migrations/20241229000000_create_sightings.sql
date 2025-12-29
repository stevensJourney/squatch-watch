-- Create sightings table
CREATE TABLE sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  comments TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

-- Allow users to read all sightings
CREATE POLICY "Anyone can read sightings" ON sightings
  FOR SELECT USING (true);

-- Allow users to insert their own sightings
CREATE POLICY "Users can insert own sightings" ON sightings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own sightings
CREATE POLICY "Users can delete own sightings" ON sightings
  FOR DELETE USING (auth.uid() = user_id);

-- Enable replication for PowerSync
ALTER TABLE sightings REPLICA IDENTITY FULL;

-- Create publication for PowerSync
CREATE PUBLICATION powersync FOR TABLE sightings;

