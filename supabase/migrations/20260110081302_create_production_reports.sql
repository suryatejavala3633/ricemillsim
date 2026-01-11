/*
  # Production Reports System
  
  Creates a system to track actual production output and calculate real yields.
  This is separate from production_batches which tracks planned production.
  
  1. New Tables
    - `production_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `report_date` (timestamptz) - Production date
      - `rice_type` (text) - 'raw' or 'boiled'
      - `number_of_acks` (numeric) - Number of ACKs produced
      - `raw_rice_qty` (numeric) - Raw rice produced in qtls
      - `broken_rice_qty` (numeric) - Broken rice produced in qtls
      - `bran_qty` (numeric) - Bran produced in qtls
      - `param_qty` (numeric) - Param produced in qtls
      - `rejection_rice_qty` (numeric) - Rejection rice produced in qtls
      - `husk_qty` (numeric) - Husk produced in qtls
      - `frk_qty` (numeric) - FRK used in qtls (for fortified rice calculation)
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `production_reports` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS production_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  report_date timestamptz NOT NULL DEFAULT now(),
  rice_type text NOT NULL DEFAULT 'raw',
  number_of_acks numeric NOT NULL,
  raw_rice_qty numeric NOT NULL DEFAULT 0,
  broken_rice_qty numeric NOT NULL DEFAULT 0,
  bran_qty numeric NOT NULL DEFAULT 0,
  param_qty numeric NOT NULL DEFAULT 0,
  rejection_rice_qty numeric NOT NULL DEFAULT 0,
  husk_qty numeric NOT NULL DEFAULT 0,
  frk_qty numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE production_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own production reports"
  ON production_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own production reports"
  ON production_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own production reports"
  ON production_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own production reports"
  ON production_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_production_reports_user_id ON production_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_production_reports_report_date ON production_reports(report_date DESC);