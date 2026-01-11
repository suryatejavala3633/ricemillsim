/*
  # Create Pricing Management System

  ## Purpose
  This migration creates a comprehensive pricing management system for CMR Rice Mill
  to track purchase and sale prices of all items with historical records.

  ## New Tables

  ### 1. `item_categories`
  Categories for organizing different types of items
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Category name (e.g., "Paddy", "Rice", "By-Products")
  - `description` (text) - Category description
  - `display_order` (integer) - Order for display in UI
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 2. `pricing_items`
  Master table for all items that can be bought or sold
  - `id` (uuid, primary key) - Unique identifier
  - `category_id` (uuid, foreign key) - Reference to category
  - `name` (text) - Item name (e.g., "Head Rice", "Broken Rice", "Bran")
  - `code` (text, unique) - Short code for the item (e.g., "HEAD_RICE")
  - `unit` (text) - Unit of measurement (e.g., "Qtl", "Kg", "Bag")
  - `item_type` (text) - Type: "purchase", "sale", or "both"
  - `is_active` (boolean) - Whether item is currently active
  - `notes` (text) - Additional notes about the item
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `price_records`
  Historical price records for all items
  - `id` (uuid, primary key) - Unique identifier
  - `item_id` (uuid, foreign key) - Reference to pricing_items
  - `purchase_price` (decimal) - Purchase/buying price per unit
  - `sale_price` (decimal) - Sale/selling price per unit
  - `margin_amount` (decimal) - Calculated margin (sale - purchase)
  - `margin_percent` (decimal) - Calculated margin percentage
  - `effective_date` (date) - Date from which this price is effective
  - `is_current` (boolean) - Whether this is the current active price
  - `notes` (text) - Notes about price changes, market conditions, etc.
  - `created_at` (timestamptz) - Record creation timestamp
  - `created_by` (text) - User who created the record

  ## Security
  - Enable RLS on all tables
  - Add policies for public access (since no auth is implemented)
  
  ## Indexes
  - Index on item_code for quick lookups
  - Index on effective_date and is_current for price queries
  - Index on category_id for filtering

  ## Sample Data
  Pre-populate with common rice mill items
*/

CREATE TABLE IF NOT EXISTS item_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES item_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  unit text NOT NULL DEFAULT 'Qtl',
  item_type text NOT NULL DEFAULT 'both' CHECK (item_type IN ('purchase', 'sale', 'both')),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES pricing_items(id) ON DELETE CASCADE NOT NULL,
  purchase_price decimal(12, 2) DEFAULT 0,
  sale_price decimal(12, 2) DEFAULT 0,
  margin_amount decimal(12, 2) GENERATED ALWAYS AS (sale_price - purchase_price) STORED,
  margin_percent decimal(8, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN purchase_price > 0 THEN ((sale_price - purchase_price) / purchase_price * 100)
      ELSE 0
    END
  ) STORED,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  is_current boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_pricing_items_code ON pricing_items(code);
CREATE INDEX IF NOT EXISTS idx_pricing_items_category ON pricing_items(category_id);
CREATE INDEX IF NOT EXISTS idx_pricing_items_active ON pricing_items(is_active);
CREATE INDEX IF NOT EXISTS idx_price_records_item ON price_records(item_id);
CREATE INDEX IF NOT EXISTS idx_price_records_current ON price_records(is_current, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_records_date ON price_records(effective_date DESC);

ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories"
  ON item_categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to categories"
  ON item_categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to categories"
  ON item_categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from categories"
  ON item_categories FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to items"
  ON pricing_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to items"
  ON pricing_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to items"
  ON pricing_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from items"
  ON pricing_items FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to prices"
  ON price_records FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to prices"
  ON price_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to prices"
  ON price_records FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from prices"
  ON price_records FOR DELETE
  USING (true);

INSERT INTO item_categories (name, description, display_order) VALUES
  ('Paddy', 'Raw paddy purchases', 1),
  ('Rice Products', 'Rice and rice-based products', 2),
  ('By-Products', 'By-products from milling process', 3)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  paddy_cat_id uuid;
  rice_cat_id uuid;
  byproduct_cat_id uuid;
BEGIN
  SELECT id INTO paddy_cat_id FROM item_categories WHERE name = 'Paddy';
  SELECT id INTO rice_cat_id FROM item_categories WHERE name = 'Rice Products';
  SELECT id INTO byproduct_cat_id FROM item_categories WHERE name = 'By-Products';

  INSERT INTO pricing_items (category_id, name, code, unit, item_type, notes) VALUES
    (paddy_cat_id, 'Raw Paddy', 'RAW_PADDY', 'Qtl', 'purchase', 'Raw paddy for milling'),
    (paddy_cat_id, 'Boiled Paddy', 'BOILED_PADDY', 'Qtl', 'purchase', 'Boiled paddy for milling'),
    (rice_cat_id, 'Head Rice (ACK)', 'HEAD_RICE', 'Qtl', 'sale', 'Premium quality head rice'),
    (rice_cat_id, 'Head Rice - Purchase', 'HEAD_RICE_PURCHASE', 'Qtl', 'purchase', 'Head rice purchased to cover shortfall'),
    (byproduct_cat_id, 'Broken Rice', 'BROKEN_RICE', 'Qtl', 'sale', 'Broken rice by-product'),
    (byproduct_cat_id, 'Bran', 'BRAN', 'Qtl', 'sale', 'Rice bran'),
    (byproduct_cat_id, 'Param (Short Broken)', 'PARAM', 'Qtl', 'sale', 'Short broken rice'),
    (byproduct_cat_id, 'Rejection Rice', 'REJECTION_RICE', 'Qtl', 'sale', 'Rejected rice'),
    (byproduct_cat_id, 'Husk', 'HUSK', 'Qtl', 'sale', 'Rice husk')
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO price_records (item_id, purchase_price, sale_price, effective_date, notes)
  SELECT id, 
    CASE 
      WHEN code = 'RAW_PADDY' THEN 2500
      WHEN code = 'BOILED_PADDY' THEN 2600
      WHEN code = 'HEAD_RICE_PURCHASE' THEN 3800
      ELSE 0
    END,
    CASE
      WHEN code = 'HEAD_RICE' THEN 4000
      WHEN code = 'BROKEN_RICE' THEN 2800
      WHEN code = 'BRAN' THEN 2000
      WHEN code = 'PARAM' THEN 2500
      WHEN code = 'REJECTION_RICE' THEN 2200
      WHEN code = 'HUSK' THEN 500
      ELSE 0
    END,
    CURRENT_DATE,
    'Initial sample prices'
  FROM pricing_items
  WHERE NOT EXISTS (
    SELECT 1 FROM price_records WHERE item_id = pricing_items.id
  );
END $$;