/*
  # Create Lorry Freight and Enhanced Wages System
  
  Creates comprehensive tracking for transportation, wages, and hamali work
  to support the complete CMR production workflow.
  
  1. New Tables
    - `lorry_freight` - Track deliveries to FCI with transporter details
    - `transporters` - Master list of transporters
    - `supervisor_wages` - Wages for supervisors and mill operators
    - `hamali_work` - Detailed hamali work tracking
    
  2. Features
    - ACK-wise delivery tracking
    - Transporter-wise dues calculation
    - Wage management for different roles
    - Hamali work expense tracking
    - Season-based data isolation
    
  3. Security
    - RLS enabled on all tables
    - User-specific access policies
*/

-- Transporters master table
CREATE TABLE IF NOT EXISTS transporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  contact_number text DEFAULT '',
  address text DEFAULT '',
  pan_number text DEFAULT '',
  notes text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transporters"
  ON transporters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transporters"
  ON transporters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transporters"
  ON transporters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transporters"
  ON transporters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Lorry freight tracking
CREATE TABLE IF NOT EXISTS lorry_freight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  season text DEFAULT 'Rabi 24-25',
  ack_number text NOT NULL,
  delivery_date date DEFAULT CURRENT_DATE,
  vehicle_number text DEFAULT '',
  transporter_id uuid REFERENCES transporters(id),
  transporter_name text DEFAULT '',
  quantity_qtls numeric DEFAULT 290,
  freight_rate numeric DEFAULT 0,
  total_freight numeric DEFAULT 0,
  advance_paid numeric DEFAULT 0,
  balance_due numeric DEFAULT 0,
  payment_status text DEFAULT 'pending',
  destination text DEFAULT 'FCI',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (payment_status IN ('pending', 'partial', 'paid'))
);

ALTER TABLE lorry_freight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own freight records"
  ON lorry_freight FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freight records"
  ON lorry_freight FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own freight records"
  ON lorry_freight FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own freight records"
  ON lorry_freight FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lorry_freight_season ON lorry_freight(user_id, season);
CREATE INDEX IF NOT EXISTS idx_lorry_freight_transporter ON lorry_freight(transporter_id);
CREATE INDEX IF NOT EXISTS idx_lorry_freight_ack ON lorry_freight(user_id, ack_number);

-- Supervisor and operator wages
CREATE TABLE IF NOT EXISTS supervisor_wages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  season text DEFAULT 'Rabi 24-25',
  employee_name text NOT NULL,
  role text DEFAULT 'operator',
  payment_date date DEFAULT CURRENT_DATE,
  period_start date,
  period_end date,
  base_salary numeric DEFAULT 0,
  ack_bonus numeric DEFAULT 0,
  acks_completed integer DEFAULT 0,
  overtime_hours numeric DEFAULT 0,
  overtime_amount numeric DEFAULT 0,
  deductions numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  payment_method text DEFAULT 'cash',
  payment_status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (role IN ('supervisor', 'operator', 'helper', 'technician')),
  CHECK (payment_status IN ('pending', 'paid'))
);

ALTER TABLE supervisor_wages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supervisor wages"
  ON supervisor_wages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supervisor wages"
  ON supervisor_wages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supervisor wages"
  ON supervisor_wages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supervisor wages"
  ON supervisor_wages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_supervisor_wages_season ON supervisor_wages(user_id, season);
CREATE INDEX IF NOT EXISTS idx_supervisor_wages_employee ON supervisor_wages(user_id, employee_name);

-- Enhanced hamali work tracking
CREATE TABLE IF NOT EXISTS hamali_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  season text DEFAULT 'Rabi 24-25',
  work_date date DEFAULT CURRENT_DATE,
  work_type text DEFAULT 'loading',
  worker_name text NOT NULL,
  material_type text DEFAULT 'paddy',
  quantity_qtls numeric DEFAULT 0,
  bags_count integer DEFAULT 0,
  rate_per_qtl numeric DEFAULT 0,
  rate_per_bag numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  ack_reference text DEFAULT '',
  payment_status text DEFAULT 'pending',
  payment_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (work_type IN ('loading', 'unloading', 'shifting', 'stacking')),
  CHECK (material_type IN ('paddy', 'rice', 'byproduct', 'frk', 'gunny', 'other')),
  CHECK (payment_status IN ('pending', 'paid'))
);

ALTER TABLE hamali_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hamali work"
  ON hamali_work FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hamali work"
  ON hamali_work FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hamali work"
  ON hamali_work FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hamali work"
  ON hamali_work FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_hamali_work_season ON hamali_work(user_id, season);
CREATE INDEX IF NOT EXISTS idx_hamali_work_worker ON hamali_work(user_id, worker_name);
CREATE INDEX IF NOT EXISTS idx_hamali_work_date ON hamali_work(user_id, work_date);