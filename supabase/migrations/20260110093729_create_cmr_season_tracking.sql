/*
  # CMR Season Tracking System
  
  Creates a comprehensive system for tracking CMR (Custom Milled Rice) season data including
  paddy receipts, CMR deliveries, balances, and ACK counts by category.
  
  1. New Tables
    - `cmr_season_summary`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `season` (text) - Season identifier (e.g., 'Rabi 24-25')
      - `paddy_received_qtls` (numeric) - Total paddy received by mill
      - `resultant_cmr_qtls` (numeric) - Resultant CMR from paddy received
      - `paddy_balance_qtls` (numeric) - Balance paddy to be delivered
      - `cmr_balance_qtls` (numeric) - Balance CMR to be delivered
      - `cmr_delivered_fci_raw` (numeric) - CMR delivered to FCI Raw
      - `cmr_delivered_fci_boiled` (numeric) - CMR delivered to FCI Boiled
      - `cmr_delivered_central_pool` (numeric) - CMR delivered to Central Pool
      - `cmr_delivered_state_pool` (numeric) - CMR delivered to State Pool
      - `paddy_delivered_fci_raw` (numeric) - Paddy equivalent for FCI Raw
      - `paddy_delivered_fci_boiled` (numeric) - Paddy equivalent for FCI Boiled
      - `paddy_delivered_central_pool` (numeric) - Paddy equivalent for Central Pool
      - `paddy_delivered_state_pool` (numeric) - Paddy equivalent for State Pool
      - `acks_fci` (integer) - Total ACKs for FCI
      - `acks_central_pool` (integer) - Total ACKs for Central Pool
      - `acks_state_pool` (integer) - Total ACKs for State Pool
      - `gate_in_fci` (integer) - Gate in count for FCI
      - `gate_in_central_pool` (integer) - Gate in count for Central Pool
      - `gate_in_state_pool` (integer) - Gate in count for State Pool
      - `pending_dumping_ds_fci` (integer) - Pending at Dumping DS for FCI
      - `pending_dumping_ds_central_pool` (integer) - Pending at Dumping DS for Central Pool
      - `pending_dumping_ds_state_pool` (integer) - Pending at Dumping DS for State Pool
      - `pending_dumping_md_fci` (integer) - Pending at Dumping MD for FCI
      - `pending_dumping_md_central_pool` (integer) - Pending at Dumping MD for Central Pool
      - `pending_dumping_md_state_pool` (integer) - Pending at Dumping MD for State Pool
      - `last_updated` (timestamptz) - Last portal refresh timestamp
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on cmr_season_summary
    - Add policies for authenticated users to manage their own data
  
  3. Indexes
    - Index on user_id and season for faster queries
*/

CREATE TABLE IF NOT EXISTS cmr_season_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  season text NOT NULL,
  paddy_received_qtls numeric DEFAULT 0,
  resultant_cmr_qtls numeric DEFAULT 0,
  paddy_balance_qtls numeric DEFAULT 0,
  cmr_balance_qtls numeric DEFAULT 0,
  cmr_delivered_fci_raw numeric DEFAULT 0,
  cmr_delivered_fci_boiled numeric DEFAULT 0,
  cmr_delivered_central_pool numeric DEFAULT 0,
  cmr_delivered_state_pool numeric DEFAULT 0,
  paddy_delivered_fci_raw numeric DEFAULT 0,
  paddy_delivered_fci_boiled numeric DEFAULT 0,
  paddy_delivered_central_pool numeric DEFAULT 0,
  paddy_delivered_state_pool numeric DEFAULT 0,
  acks_fci integer DEFAULT 0,
  acks_central_pool integer DEFAULT 0,
  acks_state_pool integer DEFAULT 0,
  gate_in_fci integer DEFAULT 0,
  gate_in_central_pool integer DEFAULT 0,
  gate_in_state_pool integer DEFAULT 0,
  pending_dumping_ds_fci integer DEFAULT 0,
  pending_dumping_ds_central_pool integer DEFAULT 0,
  pending_dumping_ds_state_pool integer DEFAULT 0,
  pending_dumping_md_fci integer DEFAULT 0,
  pending_dumping_md_central_pool integer DEFAULT 0,
  pending_dumping_md_state_pool integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season)
);

ALTER TABLE cmr_season_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CMR season summary"
  ON cmr_season_summary FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CMR season summary"
  ON cmr_season_summary FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CMR season summary"
  ON cmr_season_summary FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CMR season summary"
  ON cmr_season_summary FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cmr_season_summary_user_id ON cmr_season_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_cmr_season_summary_season ON cmr_season_summary(user_id, season);