/*
  # Create CMR Deliveries Table
  
  Tracks individual ACK-wise deliveries of CMR to various pools (FCI, Central, State).
  Each delivery record automatically calculates paddy consumed based on 67% yield.
  
  1. New Table
    - `cmr_deliveries` - Individual ACK delivery transactions
      - Tracks each ACK with destination, quantity, and status
      - Auto-calculates paddy consumed from CMR delivered
      - Links to season for aggregation
  
  2. Features
    - Automatic paddy consumption calculation
    - Gate-in status tracking
    - Dumping status (DS/MD) tracking
    - Delivery status workflow
  
  3. Security
    - RLS enabled
    - User-specific access
*/

CREATE TABLE IF NOT EXISTS cmr_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  season text DEFAULT 'Rabi 24-25',
  delivery_date date DEFAULT CURRENT_DATE,
  ack_number text NOT NULL,
  destination_pool text DEFAULT 'fci',
  variety text DEFAULT 'raw',
  cmr_quantity_qtls numeric NOT NULL DEFAULT 290,
  paddy_consumed_qtls numeric DEFAULT 0,
  vehicle_number text DEFAULT '',
  driver_name text DEFAULT '',
  delivery_status text DEFAULT 'pending',
  gate_in_status boolean DEFAULT false,
  gate_in_date date,
  dumping_status text DEFAULT 'pending_ds',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (destination_pool IN ('fci', 'central', 'state')),
  CHECK (variety IN ('raw', 'boiled')),
  CHECK (delivery_status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  CHECK (dumping_status IN ('pending_ds', 'pending_md', 'completed', 'none'))
);

ALTER TABLE cmr_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cmr deliveries"
  ON cmr_deliveries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cmr deliveries"
  ON cmr_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cmr deliveries"
  ON cmr_deliveries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cmr deliveries"
  ON cmr_deliveries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cmr_deliveries_user_season ON cmr_deliveries(user_id, season);
CREATE INDEX IF NOT EXISTS idx_cmr_deliveries_ack ON cmr_deliveries(user_id, ack_number);

-- Trigger to auto-calculate paddy consumed (reverse of 67% yield)
CREATE OR REPLACE FUNCTION calculate_cmr_paddy_consumed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.paddy_consumed_qtls := ROUND((NEW.cmr_quantity_qtls / 0.67)::numeric, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cmr_paddy_consumed ON cmr_deliveries;
CREATE TRIGGER trigger_cmr_paddy_consumed
  BEFORE INSERT OR UPDATE OF cmr_quantity_qtls ON cmr_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cmr_paddy_consumed();