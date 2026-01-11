/*
  # Power Factor Tracking System

  ## Purpose
  Track daily electricity readings (KWH and KVAH) to monitor Power Factor (PF) and ensure it doesn't deteriorate over time.

  ## Tables

  ### electricity_readings
  Stores daily meter readings for KWH and KVAH
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key to auth.users) - Owner of the reading
  - `reading_date` (timestamptz) - Date and time of the reading
  - `kwh_reading` (decimal) - Kilowatt-hour meter reading
  - `kvah_reading` (decimal) - Kilovolt-ampere-hour meter reading
  - `is_bill_reading` (boolean) - True if this is from an electricity bill
  - `notes` (text) - Optional notes about the reading
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Indexes
  - Index on user_id and reading_date for fast querying
  - Index on user_id and is_bill_reading to quickly find bill readings

  ## Security
  - RLS enabled on all tables
  - Users can only access their own readings
  - Policies for SELECT, INSERT, UPDATE, DELETE

  ## Calculated Values
  Power Factor (PF) = (KWH difference) / (KVAH difference)
  This calculation is done in the application layer based on consecutive readings
*/

-- Create electricity_readings table
CREATE TABLE IF NOT EXISTS electricity_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reading_date timestamptz NOT NULL,
  kwh_reading decimal(12, 2) NOT NULL,
  kvah_reading decimal(12, 2) NOT NULL,
  is_bill_reading boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_electricity_user_date 
  ON electricity_readings(user_id, reading_date DESC);

CREATE INDEX IF NOT EXISTS idx_electricity_bill_readings 
  ON electricity_readings(user_id, is_bill_reading) 
  WHERE is_bill_reading = true;

-- Enable RLS
ALTER TABLE electricity_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies with optimized auth.uid() calls
CREATE POLICY "Users can view own electricity readings"
  ON electricity_readings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own electricity readings"
  ON electricity_readings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own electricity readings"
  ON electricity_readings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own electricity readings"
  ON electricity_readings FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_electricity_readings_updated_at ON electricity_readings;
CREATE TRIGGER update_electricity_readings_updated_at
  BEFORE UPDATE ON electricity_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();