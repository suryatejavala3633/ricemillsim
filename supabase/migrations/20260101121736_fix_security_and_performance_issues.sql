/*
  # Fix Security and Performance Issues

  ## Purpose
  This migration addresses critical security and performance issues identified by Supabase:
  
  1. Add missing foreign key index
  2. Optimize RLS policies for better performance
  3. Secure function search paths

  ## Changes

  ### 1. Missing Index
  - Add index on frk_usage.frk_inventory_id for foreign key performance

  ### 2. RLS Policy Optimization
  All RLS policies updated to use (select auth.uid()) instead of auth.uid()
  This prevents re-evaluation of auth functions for each row, significantly improving query performance

  ### 3. Function Security
  - Set immutable search_path on update_updated_at_column function

  ## Performance Impact
  - Queries using RLS will be faster due to single evaluation of auth.uid()
  - Foreign key lookups will be faster with proper indexing
  - Function execution is more secure with explicit search_path
*/

-- Add missing foreign key index
CREATE INDEX IF NOT EXISTS idx_frk_usage_frk_inv ON frk_usage(frk_inventory_id);

-- Drop and recreate all RLS policies with optimized auth.uid() calls

-- mill_settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON mill_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON mill_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON mill_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON mill_settings;

CREATE POLICY "Users can view own settings"
  ON mill_settings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own settings"
  ON mill_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own settings"
  ON mill_settings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own settings"
  ON mill_settings FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- wages_records policies
DROP POLICY IF EXISTS "Users can view own wages" ON wages_records;
DROP POLICY IF EXISTS "Users can insert own wages" ON wages_records;
DROP POLICY IF EXISTS "Users can update own wages" ON wages_records;
DROP POLICY IF EXISTS "Users can delete own wages" ON wages_records;

CREATE POLICY "Users can view own wages"
  ON wages_records FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own wages"
  ON wages_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own wages"
  ON wages_records FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own wages"
  ON wages_records FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- hamali_records policies
DROP POLICY IF EXISTS "Users can view own hamali" ON hamali_records;
DROP POLICY IF EXISTS "Users can insert own hamali" ON hamali_records;
DROP POLICY IF EXISTS "Users can update own hamali" ON hamali_records;
DROP POLICY IF EXISTS "Users can delete own hamali" ON hamali_records;

CREATE POLICY "Users can view own hamali"
  ON hamali_records FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own hamali"
  ON hamali_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own hamali"
  ON hamali_records FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own hamali"
  ON hamali_records FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- production_batches policies
DROP POLICY IF EXISTS "Users can view own production" ON production_batches;
DROP POLICY IF EXISTS "Users can insert own production" ON production_batches;
DROP POLICY IF EXISTS "Users can update own production" ON production_batches;
DROP POLICY IF EXISTS "Users can delete own production" ON production_batches;

CREATE POLICY "Users can view own production"
  ON production_batches FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own production"
  ON production_batches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own production"
  ON production_batches FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own production"
  ON production_batches FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- fci_deliveries policies
DROP POLICY IF EXISTS "Users can view own fci" ON fci_deliveries;
DROP POLICY IF EXISTS "Users can insert own fci" ON fci_deliveries;
DROP POLICY IF EXISTS "Users can update own fci" ON fci_deliveries;
DROP POLICY IF EXISTS "Users can delete own fci" ON fci_deliveries;

CREATE POLICY "Users can view own fci"
  ON fci_deliveries FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own fci"
  ON fci_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own fci"
  ON fci_deliveries FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own fci"
  ON fci_deliveries FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- gunny_inventory policies
DROP POLICY IF EXISTS "Users can view own gunny inventory" ON gunny_inventory;
DROP POLICY IF EXISTS "Users can insert own gunny inventory" ON gunny_inventory;
DROP POLICY IF EXISTS "Users can update own gunny inventory" ON gunny_inventory;
DROP POLICY IF EXISTS "Users can delete own gunny inventory" ON gunny_inventory;

CREATE POLICY "Users can view own gunny inventory"
  ON gunny_inventory FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own gunny inventory"
  ON gunny_inventory FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own gunny inventory"
  ON gunny_inventory FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own gunny inventory"
  ON gunny_inventory FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- gunny_transactions policies
DROP POLICY IF EXISTS "Users can view own gunny transactions" ON gunny_transactions;
DROP POLICY IF EXISTS "Users can insert own gunny transactions" ON gunny_transactions;
DROP POLICY IF EXISTS "Users can update own gunny transactions" ON gunny_transactions;
DROP POLICY IF EXISTS "Users can delete own gunny transactions" ON gunny_transactions;

CREATE POLICY "Users can view own gunny transactions"
  ON gunny_transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own gunny transactions"
  ON gunny_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own gunny transactions"
  ON gunny_transactions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own gunny transactions"
  ON gunny_transactions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- frk_inventory policies
DROP POLICY IF EXISTS "Users can view own frk inventory" ON frk_inventory;
DROP POLICY IF EXISTS "Users can insert own frk inventory" ON frk_inventory;
DROP POLICY IF EXISTS "Users can update own frk inventory" ON frk_inventory;
DROP POLICY IF EXISTS "Users can delete own frk inventory" ON frk_inventory;

CREATE POLICY "Users can view own frk inventory"
  ON frk_inventory FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own frk inventory"
  ON frk_inventory FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own frk inventory"
  ON frk_inventory FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own frk inventory"
  ON frk_inventory FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- frk_usage policies
DROP POLICY IF EXISTS "Users can view own frk usage" ON frk_usage;
DROP POLICY IF EXISTS "Users can insert own frk usage" ON frk_usage;
DROP POLICY IF EXISTS "Users can update own frk usage" ON frk_usage;
DROP POLICY IF EXISTS "Users can delete own frk usage" ON frk_usage;

CREATE POLICY "Users can view own frk usage"
  ON frk_usage FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own frk usage"
  ON frk_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own frk usage"
  ON frk_usage FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own frk usage"
  ON frk_usage FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- calculator_snapshots policies
DROP POLICY IF EXISTS "Users can view own snapshots" ON calculator_snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON calculator_snapshots;
DROP POLICY IF EXISTS "Users can update own snapshots" ON calculator_snapshots;
DROP POLICY IF EXISTS "Users can delete own snapshots" ON calculator_snapshots;

CREATE POLICY "Users can view own snapshots"
  ON calculator_snapshots FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own snapshots"
  ON calculator_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own snapshots"
  ON calculator_snapshots FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own snapshots"
  ON calculator_snapshots FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Fix function security by setting explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;