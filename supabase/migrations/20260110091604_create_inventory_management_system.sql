/*
  # Inventory Management System
  
  Creates a comprehensive system for tracking consumables and stock levels.
  
  1. New Tables
    - `frk_batches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `batch_number` (text) - Unique batch identification
      - `received_date` (date) - Date batch was received
      - `quantity_qtls` (numeric) - Quantity in quintals
      - `current_stock_qtls` (numeric) - Current stock remaining
      - `kernel_test_certificate_number` (text) - Kernel test cert number
      - `kernel_test_date` (date) - Kernel test date
      - `kernel_test_expiry` (date) - Kernel test expiry
      - `premix_test_certificate_number` (text) - Premix test cert number
      - `premix_test_date` (date) - Premix test date
      - `premix_test_expiry` (date) - Premix test expiry
      - `supplier_name` (text) - Supplier information
      - `notes` (text) - Additional notes
      - `status` (text) - 'active', 'depleted', 'expired'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stock_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `item_type` (text) - 'gunnies', 'stickers', 'frk'
      - `item_name` (text) - Display name
      - `current_stock` (numeric) - Current stock quantity
      - `unit` (text) - Unit of measurement
      - `reorder_level` (numeric) - Alert when stock falls below
      - `year` (text) - Year/season (e.g., '2024-25')
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stock_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `item_type` (text) - 'gunnies', 'stickers', 'frk'
      - `transaction_type` (text) - 'in', 'out'
      - `transaction_date` (date) - Transaction date
      - `quantity` (numeric) - Quantity moved
      - `frk_batch_id` (uuid, references frk_batches) - For FRK transactions
      - `reference_type` (text) - 'ack_production', 'paddy_receipt', 'purchase', 'manual'
      - `reference_id` (text) - ID of related entity (e.g., ACK number)
      - `from_location` (text) - Source (for stock in)
      - `notes` (text) - Transaction notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cmr_paddy_receipts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `receipt_date` (date) - Date paddy was received
      - `paddy_quantity_qtls` (numeric) - Paddy quantity in quintals
      - `paddy_bags` (numeric) - Number of bags
      - `gunnies_received` (numeric) - Number of gunnies received with paddy
      - `vehicle_number` (text) - Vehicle number
      - `supplier` (text) - Supplier/source
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cmr_rice_target`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `target_year` (text) - Year/season (e.g., '2024-25')
      - `initial_target_qtls` (numeric) - Initial delivery target
      - `current_balance_qtls` (numeric) - Remaining delivery target
      - `acks_completed` (integer) - Number of ACKs completed
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
  
  3. Indexes
    - Index on user_id, dates, and item types for faster queries
    - Index on batch numbers and reference IDs
*/

CREATE TABLE IF NOT EXISTS frk_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  batch_number text NOT NULL,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  quantity_qtls numeric NOT NULL DEFAULT 0,
  current_stock_qtls numeric NOT NULL DEFAULT 0,
  kernel_test_certificate_number text DEFAULT '',
  kernel_test_date date,
  kernel_test_expiry date,
  premix_test_certificate_number text DEFAULT '',
  premix_test_date date,
  premix_test_expiry date,
  supplier_name text DEFAULT '',
  notes text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, batch_number)
);

CREATE TABLE IF NOT EXISTS stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  item_type text NOT NULL,
  item_name text NOT NULL,
  current_stock numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'pieces',
  reorder_level numeric DEFAULT 0,
  year text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, year)
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  item_type text NOT NULL,
  transaction_type text NOT NULL,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  quantity numeric NOT NULL DEFAULT 0,
  frk_batch_id uuid REFERENCES frk_batches(id),
  reference_type text DEFAULT 'manual',
  reference_id text DEFAULT '',
  from_location text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cmr_paddy_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  receipt_date date NOT NULL DEFAULT CURRENT_DATE,
  paddy_quantity_qtls numeric NOT NULL DEFAULT 0,
  paddy_bags numeric NOT NULL DEFAULT 0,
  gunnies_received numeric NOT NULL DEFAULT 0,
  vehicle_number text DEFAULT '',
  supplier text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cmr_rice_target (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  target_year text NOT NULL,
  initial_target_qtls numeric NOT NULL DEFAULT 0,
  current_balance_qtls numeric NOT NULL DEFAULT 0,
  acks_completed integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_year)
);

ALTER TABLE frk_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmr_paddy_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmr_rice_target ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own FRK batches"
  ON frk_batches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own FRK batches"
  ON frk_batches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own FRK batches"
  ON frk_batches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own FRK batches"
  ON frk_batches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stock items"
  ON stock_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock items"
  ON stock_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stock items"
  ON stock_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stock items"
  ON stock_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stock transactions"
  ON stock_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock transactions"
  ON stock_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stock transactions"
  ON stock_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stock transactions"
  ON stock_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own paddy receipts"
  ON cmr_paddy_receipts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paddy receipts"
  ON cmr_paddy_receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own paddy receipts"
  ON cmr_paddy_receipts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own paddy receipts"
  ON cmr_paddy_receipts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rice target"
  ON cmr_rice_target FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rice target"
  ON cmr_rice_target FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rice target"
  ON cmr_rice_target FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rice target"
  ON cmr_rice_target FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_frk_batches_user_id ON frk_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_frk_batches_batch_number ON frk_batches(user_id, batch_number);
CREATE INDEX IF NOT EXISTS idx_frk_batches_status ON frk_batches(user_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_items_user_id ON stock_items(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_items_type ON stock_items(user_id, item_type);

CREATE INDEX IF NOT EXISTS idx_stock_transactions_user_id ON stock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(user_id, item_type, transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_reference ON stock_transactions(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_cmr_paddy_receipts_user_id ON cmr_paddy_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_cmr_paddy_receipts_date ON cmr_paddy_receipts(receipt_date DESC);

CREATE INDEX IF NOT EXISTS idx_cmr_rice_target_user_id ON cmr_rice_target(user_id);
CREATE INDEX IF NOT EXISTS idx_cmr_rice_target_year ON cmr_rice_target(user_id, target_year);