/*
  # Add Season Tracking to All Tables (v2)
  
  Adds season field to all relevant tables to allow complete data separation
  between different crop seasons (e.g., Rabi 2024-25, Kharif 2025-26).
  
  1. Changes
    - Add `season` column to byproduct_customers
    - Add `season` column to byproduct_sales
    - Add `season` column to byproduct_rates
    - Add `season` column to byproduct_invoices
    - Add `season` column to byproduct_payments
    - Add `season` column to stock_items
    - Add `season` column to frk_batches
    - Add `season` column to cmr_paddy_receipts
    - Add `season` column to cmr_rice_target
    - Add `season` column to ack_production
    - Add `season` column to production_reports
    - Create user_settings table for active season tracking
    
  2. Indexes
    - Add indexes on season columns for faster filtering
    
  3. Default Values
    - Set default season to 'Rabi 24-25' for existing records
*/

DO $$
BEGIN
  -- Add season to byproduct_customers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'byproduct_customers' AND column_name = 'season'
  ) THEN
    ALTER TABLE byproduct_customers ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_byproduct_customers_season ON byproduct_customers(user_id, season);
  END IF;

  -- Add season to byproduct_sales
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'byproduct_sales' AND column_name = 'season'
  ) THEN
    ALTER TABLE byproduct_sales ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_byproduct_sales_season ON byproduct_sales(user_id, season);
  END IF;

  -- Add season to byproduct_rates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'byproduct_rates' AND column_name = 'season'
  ) THEN
    ALTER TABLE byproduct_rates ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_byproduct_rates_season ON byproduct_rates(user_id, season);
  END IF;

  -- Add season to byproduct_invoices
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'byproduct_invoices' AND column_name = 'season'
  ) THEN
    ALTER TABLE byproduct_invoices ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_byproduct_invoices_season ON byproduct_invoices(user_id, season);
  END IF;

  -- Add season to byproduct_payments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'byproduct_payments' AND column_name = 'season'
  ) THEN
    ALTER TABLE byproduct_payments ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_byproduct_payments_season ON byproduct_payments(user_id, season);
  END IF;

  -- Add season to stock_items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_items' AND column_name = 'season'
  ) THEN
    ALTER TABLE stock_items ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_stock_items_season ON stock_items(user_id, season);
  END IF;

  -- Add season to frk_batches
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'frk_batches' AND column_name = 'season'
  ) THEN
    ALTER TABLE frk_batches ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_frk_batches_season ON frk_batches(user_id, season);
  END IF;

  -- Add season to cmr_paddy_receipts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cmr_paddy_receipts' AND column_name = 'season'
  ) THEN
    ALTER TABLE cmr_paddy_receipts ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_cmr_paddy_receipts_season ON cmr_paddy_receipts(user_id, season);
  END IF;

  -- Add season to cmr_rice_target
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cmr_rice_target' AND column_name = 'season'
  ) THEN
    ALTER TABLE cmr_rice_target ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_cmr_rice_target_season ON cmr_rice_target(user_id, season);
  END IF;

  -- Add season to ack_production
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ack_production' AND column_name = 'season'
  ) THEN
    ALTER TABLE ack_production ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_ack_production_season ON ack_production(user_id, season);
  END IF;

  -- Add season to production_reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'production_reports' AND column_name = 'season'
  ) THEN
    ALTER TABLE production_reports ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_production_reports_season ON production_reports(user_id, season);
  END IF;
  
  -- Add season to stock_transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_transactions' AND column_name = 'season'
  ) THEN
    ALTER TABLE stock_transactions ADD COLUMN season text DEFAULT 'Rabi 24-25';
    CREATE INDEX IF NOT EXISTS idx_stock_transactions_season ON stock_transactions(user_id, season);
  END IF;
END $$;

-- Create user settings table for tracking active season
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  active_season text DEFAULT 'Rabi 24-25',
  available_seasons text[] DEFAULT ARRAY['Rabi 24-25', 'Kharif 25-26', 'Rabi 25-26', 'Kharif 26-27'],
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);