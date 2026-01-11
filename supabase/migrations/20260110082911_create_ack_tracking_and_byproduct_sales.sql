/*
  # ACK Production and By-Product Sales Tracking
  
  Creates a system to track ACK production and by-product sales separately.
  
  1. New Tables
    - `ack_production`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `ack_number` (text) - ACK number (e.g., "ACK-001")
      - `production_date` (date) - Production date
      - `rice_type` (text) - 'raw' or 'boiled'
      - `fortified_rice_qty` (numeric) - Total fortified rice in qtls (290)
      - `raw_rice_qty` (numeric) - Raw rice component in qtls (287.1)
      - `frk_qty` (numeric) - FRK component in qtls (2.9)
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `byproduct_sales`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `sale_date` (date) - Sale date
      - `byproduct_type` (text) - 'broken_rice', 'bran', 'param', 'rejection_rice', 'husk'
      - `quantity` (numeric) - Quantity sold in qtls
      - `from_ack_number` (text) - Starting ACK number
      - `to_ack_number` (text) - Ending ACK number
      - `ack_count` (numeric) - Number of ACKs this came from
      - `rate` (numeric) - Sale rate per qtl (optional)
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
  
  3. Indexes
    - Index on user_id and dates for faster queries
    - Index on ACK numbers for lookup
*/

CREATE TABLE IF NOT EXISTS ack_production (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  ack_number text NOT NULL,
  production_date date NOT NULL DEFAULT CURRENT_DATE,
  rice_type text NOT NULL DEFAULT 'raw',
  fortified_rice_qty numeric NOT NULL DEFAULT 290,
  raw_rice_qty numeric NOT NULL DEFAULT 0,
  frk_qty numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ack_number)
);

CREATE TABLE IF NOT EXISTS byproduct_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  byproduct_type text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  from_ack_number text NOT NULL,
  to_ack_number text NOT NULL,
  ack_count numeric NOT NULL DEFAULT 1,
  rate numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ack_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE byproduct_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ACK production"
  ON ack_production FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ACK production"
  ON ack_production FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ACK production"
  ON ack_production FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ACK production"
  ON ack_production FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own byproduct sales"
  ON byproduct_sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own byproduct sales"
  ON byproduct_sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own byproduct sales"
  ON byproduct_sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own byproduct sales"
  ON byproduct_sales FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ack_production_user_id ON ack_production(user_id);
CREATE INDEX IF NOT EXISTS idx_ack_production_date ON ack_production(production_date DESC);
CREATE INDEX IF NOT EXISTS idx_ack_production_ack_number ON ack_production(user_id, ack_number);

CREATE INDEX IF NOT EXISTS idx_byproduct_sales_user_id ON byproduct_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_sales_date ON byproduct_sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_byproduct_sales_type ON byproduct_sales(user_id, byproduct_type);