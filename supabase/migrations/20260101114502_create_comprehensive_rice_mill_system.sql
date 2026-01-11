/*
  # Create Comprehensive Rice Mill Management System

  ## Purpose
  This migration creates a complete, integrated database system for CMR Rice Mill
  that supports all operations with full data control, automatic backup, and cross-module synchronization.

  ## New Tables

  ### 1. `mill_settings`
  User-specific settings and preferences
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `mill_name` (text) - Name of the mill
  - `default_yields` (jsonb) - Default yield percentages
  - `default_working_costs` (jsonb) - Default working costs
  - `preferences` (jsonb) - User preferences (theme, units, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `wages_records`
  Track all wage payments to employees
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `date` (date) - Payment date
  - `employee_name` (text) - Employee name
  - `amount` (decimal) - Wage amount
  - `payment_type` (text) - Type: daily, weekly, monthly, bonus
  - `status` (text) - Status: pending, paid, cancelled
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `hamali_records`
  Track loading/unloading labor costs
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `date` (date) - Operation date
  - `worker_name` (text) - Worker name
  - `quantity` (decimal) - Quantity loaded/unloaded
  - `rate` (decimal) - Rate per unit
  - `total_amount` (decimal) - Total cost (quantity * rate)
  - `operation_type` (text) - Type: loading, unloading
  - `material_type` (text) - Type: paddy, rice, byproduct
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `production_batches`
  Track all production batches
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `batch_no` (text, unique) - Batch number
  - `date` (date) - Production date
  - `paddy_quantity_standard` (decimal) - Standard paddy quantity
  - `paddy_quantity_actual` (decimal) - Actual paddy quantity
  - `rice_type` (text) - Type: raw or boiled
  - `use_41kg_bags` (boolean) - Whether using 41kg bags
  - `yields` (jsonb) - Yield percentages
  - `head_rice_produced` (decimal) - Head rice produced
  - `byproducts` (jsonb) - By-products produced
  - `working_costs` (jsonb) - Working costs for this batch
  - `status` (text) - Status: in_progress, completed, delivered
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `fci_deliveries`
  Track FCI deliveries and ACK numbers
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `production_batch_id` (uuid, foreign key) - Reference to production_batches
  - `ack_no` (text, unique) - ACK number
  - `delivery_date` (date) - Delivery date
  - `quantity` (decimal) - Quantity delivered
  - `rice_type` (text) - Type: raw or boiled
  - `status` (text) - Status: pending, delivered, acknowledged
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. `gunny_inventory`
  Track gunny bag inventory
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `bag_type` (text) - Type: new, used
  - `bag_size` (text) - Size: 50kg, 40kg, etc.
  - `quantity` (integer) - Current quantity
  - `location` (text) - Storage location
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. `gunny_transactions`
  Track all gunny bag movements
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `date` (date) - Transaction date
  - `inventory_id` (uuid, foreign key) - Reference to gunny_inventory
  - `transaction_type` (text) - Type: purchase, usage, return, damaged
  - `quantity` (integer) - Quantity change
  - `reference_type` (text) - Reference type: production_batch, purchase_order
  - `reference_id` (uuid) - Reference to related record
  - `balance_after` (integer) - Balance after transaction
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 8. `frk_inventory`
  Track Fortified Rice Kernel inventory
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `batch_no` (text) - Supplier batch number
  - `quantity` (decimal) - Current quantity
  - `expiry_date` (date) - Expiry date
  - `supplier` (text) - Supplier name
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 9. `frk_usage`
  Track FRK usage in production
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `production_batch_id` (uuid, foreign key) - Reference to production_batches
  - `frk_inventory_id` (uuid, foreign key) - Reference to frk_inventory
  - `date` (date) - Usage date
  - `quantity_used` (decimal) - FRK quantity used
  - `rice_quantity` (decimal) - Rice quantity produced
  - `ratio_percentage` (decimal) - FRK ratio percentage
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 10. `calculator_snapshots`
  Save calculator scenarios for future reference
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `name` (text) - Snapshot name
  - `calculator_type` (text) - Type: paddy_to_rice, ack, purchase
  - `input_data` (jsonb) - Input parameters
  - `results` (jsonb) - Calculation results
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations

  ## Indexes
  - Index on user_id for all tables
  - Index on date fields for queries
  - Index on batch_no and ack_no for quick lookups
  - Index on status fields for filtering

  ## Triggers
  - Auto-update updated_at timestamps
  - Auto-calculate totals where needed
*/

-- Mill Settings
CREATE TABLE IF NOT EXISTS mill_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mill_name text DEFAULT 'CMR Rice Mill',
  default_yields jsonb DEFAULT '{"headRice": 64, "brokenRice": 2, "bran": 8, "param": 3, "rejectionRice": 1, "husk": 22}'::jsonb,
  default_working_costs jsonb DEFAULT '{"electricity": 0, "labour": 0, "salaries": 0, "hamali": 0, "spares": 0, "fciExpenses": 0, "others": 0}'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Wages Records
CREATE TABLE IF NOT EXISTS wages_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  employee_name text NOT NULL,
  amount decimal(12, 2) NOT NULL DEFAULT 0,
  payment_type text NOT NULL DEFAULT 'daily' CHECK (payment_type IN ('daily', 'weekly', 'monthly', 'bonus', 'advance', 'deduction')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hamali Records
CREATE TABLE IF NOT EXISTS hamali_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  worker_name text NOT NULL,
  quantity decimal(12, 2) NOT NULL DEFAULT 0,
  rate decimal(12, 2) NOT NULL DEFAULT 0,
  total_amount decimal(12, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  operation_type text NOT NULL DEFAULT 'loading' CHECK (operation_type IN ('loading', 'unloading')),
  material_type text NOT NULL DEFAULT 'paddy' CHECK (material_type IN ('paddy', 'rice', 'byproduct', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  batch_no text UNIQUE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  paddy_quantity_standard decimal(12, 2) NOT NULL DEFAULT 0,
  paddy_quantity_actual decimal(12, 2) NOT NULL DEFAULT 0,
  rice_type text NOT NULL DEFAULT 'raw' CHECK (rice_type IN ('raw', 'boiled')),
  use_41kg_bags boolean DEFAULT false,
  yields jsonb DEFAULT '{"headRice": 64, "brokenRice": 2, "bran": 8, "param": 3, "rejectionRice": 1, "husk": 22}'::jsonb,
  head_rice_produced decimal(12, 2) DEFAULT 0,
  byproducts jsonb DEFAULT '{}'::jsonb,
  working_costs jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'delivered')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FCI Deliveries
CREATE TABLE IF NOT EXISTS fci_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  production_batch_id uuid REFERENCES production_batches(id) ON DELETE SET NULL,
  ack_no text UNIQUE NOT NULL,
  delivery_date date NOT NULL DEFAULT CURRENT_DATE,
  quantity decimal(12, 2) NOT NULL DEFAULT 0,
  rice_type text NOT NULL DEFAULT 'raw' CHECK (rice_type IN ('raw', 'boiled')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'acknowledged', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gunny Inventory
CREATE TABLE IF NOT EXISTS gunny_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bag_type text NOT NULL DEFAULT 'new' CHECK (bag_type IN ('new', 'used')),
  bag_size text NOT NULL DEFAULT '50kg',
  quantity integer NOT NULL DEFAULT 0,
  location text DEFAULT 'Main Warehouse',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gunny Transactions
CREATE TABLE IF NOT EXISTS gunny_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  inventory_id uuid REFERENCES gunny_inventory(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'return', 'damaged', 'adjustment')),
  quantity integer NOT NULL DEFAULT 0,
  reference_type text,
  reference_id uuid,
  balance_after integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- FRK Inventory
CREATE TABLE IF NOT EXISTS frk_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  batch_no text NOT NULL,
  quantity decimal(12, 2) NOT NULL DEFAULT 0,
  expiry_date date,
  supplier text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FRK Usage
CREATE TABLE IF NOT EXISTS frk_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  production_batch_id uuid REFERENCES production_batches(id) ON DELETE CASCADE NOT NULL,
  frk_inventory_id uuid REFERENCES frk_inventory(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  quantity_used decimal(12, 2) NOT NULL DEFAULT 0,
  rice_quantity decimal(12, 2) NOT NULL DEFAULT 0,
  ratio_percentage decimal(8, 4) GENERATED ALWAYS AS (
    CASE 
      WHEN rice_quantity > 0 THEN (quantity_used / rice_quantity * 100)
      ELSE 0
    END
  ) STORED,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Calculator Snapshots
CREATE TABLE IF NOT EXISTS calculator_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calculator_type text NOT NULL CHECK (calculator_type IN ('paddy_to_rice', 'ack', 'purchase')),
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_mill_settings_user ON mill_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_wages_user_date ON wages_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_wages_status ON wages_records(status);
CREATE INDEX IF NOT EXISTS idx_hamali_user_date ON hamali_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_production_user_date ON production_batches(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_production_batch_no ON production_batches(batch_no);
CREATE INDEX IF NOT EXISTS idx_production_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_fci_user_date ON fci_deliveries(user_id, delivery_date DESC);
CREATE INDEX IF NOT EXISTS idx_fci_ack_no ON fci_deliveries(ack_no);
CREATE INDEX IF NOT EXISTS idx_fci_batch ON fci_deliveries(production_batch_id);
CREATE INDEX IF NOT EXISTS idx_gunny_inv_user ON gunny_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_gunny_trans_user_date ON gunny_transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gunny_trans_inv ON gunny_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_frk_inv_user ON frk_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_frk_usage_user_date ON frk_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_frk_usage_batch ON frk_usage(production_batch_id);
CREATE INDEX IF NOT EXISTS idx_calculator_user_date ON calculator_snapshots(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculator_type ON calculator_snapshots(calculator_type);

-- Enable Row Level Security
ALTER TABLE mill_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wages_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hamali_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE fci_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gunny_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gunny_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frk_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE frk_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mill_settings
CREATE POLICY "Users can view own settings"
  ON mill_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON mill_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON mill_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON mill_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for wages_records
CREATE POLICY "Users can view own wages"
  ON wages_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wages"
  ON wages_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wages"
  ON wages_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wages"
  ON wages_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for hamali_records
CREATE POLICY "Users can view own hamali"
  ON hamali_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hamali"
  ON hamali_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hamali"
  ON hamali_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hamali"
  ON hamali_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for production_batches
CREATE POLICY "Users can view own production"
  ON production_batches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own production"
  ON production_batches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own production"
  ON production_batches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own production"
  ON production_batches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for fci_deliveries
CREATE POLICY "Users can view own fci"
  ON fci_deliveries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fci"
  ON fci_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fci"
  ON fci_deliveries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fci"
  ON fci_deliveries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for gunny_inventory
CREATE POLICY "Users can view own gunny inventory"
  ON gunny_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gunny inventory"
  ON gunny_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gunny inventory"
  ON gunny_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gunny inventory"
  ON gunny_inventory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for gunny_transactions
CREATE POLICY "Users can view own gunny transactions"
  ON gunny_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gunny transactions"
  ON gunny_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gunny transactions"
  ON gunny_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gunny transactions"
  ON gunny_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for frk_inventory
CREATE POLICY "Users can view own frk inventory"
  ON frk_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own frk inventory"
  ON frk_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own frk inventory"
  ON frk_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own frk inventory"
  ON frk_inventory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for frk_usage
CREATE POLICY "Users can view own frk usage"
  ON frk_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own frk usage"
  ON frk_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own frk usage"
  ON frk_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own frk usage"
  ON frk_usage FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for calculator_snapshots
CREATE POLICY "Users can view own snapshots"
  ON calculator_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON calculator_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
  ON calculator_snapshots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON calculator_snapshots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mill_settings_updated_at') THEN
    CREATE TRIGGER update_mill_settings_updated_at
      BEFORE UPDATE ON mill_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wages_records_updated_at') THEN
    CREATE TRIGGER update_wages_records_updated_at
      BEFORE UPDATE ON wages_records
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hamali_records_updated_at') THEN
    CREATE TRIGGER update_hamali_records_updated_at
      BEFORE UPDATE ON hamali_records
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_production_batches_updated_at') THEN
    CREATE TRIGGER update_production_batches_updated_at
      BEFORE UPDATE ON production_batches
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fci_deliveries_updated_at') THEN
    CREATE TRIGGER update_fci_deliveries_updated_at
      BEFORE UPDATE ON fci_deliveries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gunny_inventory_updated_at') THEN
    CREATE TRIGGER update_gunny_inventory_updated_at
      BEFORE UPDATE ON gunny_inventory
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_frk_inventory_updated_at') THEN
    CREATE TRIGGER update_frk_inventory_updated_at
      BEFORE UPDATE ON frk_inventory
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;