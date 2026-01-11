/*
  # By-Product Sales Management System
  
  Creates a comprehensive system for managing by-product sales, invoicing, and payments.
  
  1. New Tables
    - `byproduct_rates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `byproduct_type` (text) - 'broken_rice', 'bran', 'param', 'rejection_rice', 'husk'
      - `rate` (numeric) - Current rate per qtl
      - `effective_from` (date) - When this rate becomes effective
      - `notes` (text) - Optional notes about the rate
      - `is_active` (boolean) - Is this the current active rate
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `byproduct_customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Customer name
      - `gstin` (text) - GST identification number (optional)
      - `address` (text) - Customer address
      - `phone` (text) - Contact number
      - `email` (text) - Email address
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `byproduct_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `invoice_number` (text) - Unique invoice number
      - `invoice_type` (text) - 'tax_invoice' or 'bill_of_supply'
      - `invoice_date` (date) - Invoice date
      - `customer_id` (uuid, references byproduct_customers) - Optional
      - `customer_name` (text) - Customer name (if not linked)
      - `customer_gstin` (text) - Customer GSTIN
      - `customer_address` (text) - Customer address
      - `subtotal` (numeric) - Total before tax
      - `cgst_rate` (numeric) - CGST rate %
      - `sgst_rate` (numeric) - SGST rate %
      - `igst_rate` (numeric) - IGST rate %
      - `cgst_amount` (numeric) - CGST amount
      - `sgst_amount` (numeric) - SGST amount
      - `igst_amount` (numeric) - IGST amount
      - `total_amount` (numeric) - Total amount including tax
      - `notes` (text) - Additional notes
      - `status` (text) - 'draft', 'issued', 'paid', 'cancelled'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `byproduct_invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, references byproduct_invoices)
      - `byproduct_type` (text) - Type of by-product
      - `description` (text) - Item description
      - `quantity` (numeric) - Quantity in qtls
      - `rate` (numeric) - Rate per qtl
      - `amount` (numeric) - Total amount (quantity × rate)
      - `from_ack_number` (text) - Starting ACK number (optional)
      - `to_ack_number` (text) - Ending ACK number (optional)
      - `created_at` (timestamptz)
    
    - `byproduct_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `invoice_id` (uuid, references byproduct_invoices)
      - `payment_date` (date) - Payment date
      - `amount` (numeric) - Payment amount
      - `payment_method` (text) - 'cash', 'cheque', 'bank_transfer', 'upi', 'other'
      - `reference_number` (text) - Cheque number, transaction ID, etc.
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
  
  3. Indexes
    - Index on user_id and dates for faster queries
    - Index on invoice numbers and customer IDs
*/

CREATE TABLE IF NOT EXISTS byproduct_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  byproduct_type text NOT NULL,
  rate numeric NOT NULL DEFAULT 0,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS byproduct_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  gstin text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS byproduct_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  invoice_number text NOT NULL,
  invoice_type text NOT NULL DEFAULT 'bill_of_supply',
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_id uuid REFERENCES byproduct_customers(id),
  customer_name text DEFAULT '',
  customer_gstin text DEFAULT '',
  customer_address text DEFAULT '',
  subtotal numeric NOT NULL DEFAULT 0,
  cgst_rate numeric DEFAULT 0,
  sgst_rate numeric DEFAULT 0,
  igst_rate numeric DEFAULT 0,
  cgst_amount numeric DEFAULT 0,
  sgst_amount numeric DEFAULT 0,
  igst_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS byproduct_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES byproduct_invoices(id) ON DELETE CASCADE NOT NULL,
  byproduct_type text NOT NULL,
  description text DEFAULT '',
  quantity numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  from_ack_number text DEFAULT '',
  to_ack_number text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS byproduct_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  invoice_id uuid REFERENCES byproduct_invoices(id) ON DELETE CASCADE NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  reference_number text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE byproduct_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE byproduct_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE byproduct_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE byproduct_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE byproduct_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own by-product rates"
  ON byproduct_rates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own by-product rates"
  ON byproduct_rates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own by-product rates"
  ON byproduct_rates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own by-product rates"
  ON byproduct_rates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own customers"
  ON byproduct_customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON byproduct_customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON byproduct_customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON byproduct_customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own invoices"
  ON byproduct_invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON byproduct_invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON byproduct_invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON byproduct_invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view invoice items for own invoices"
  ON byproduct_invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM byproduct_invoices
      WHERE byproduct_invoices.id = byproduct_invoice_items.invoice_id
      AND byproduct_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoice items for own invoices"
  ON byproduct_invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM byproduct_invoices
      WHERE byproduct_invoices.id = byproduct_invoice_items.invoice_id
      AND byproduct_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice items for own invoices"
  ON byproduct_invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM byproduct_invoices
      WHERE byproduct_invoices.id = byproduct_invoice_items.invoice_id
      AND byproduct_invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM byproduct_invoices
      WHERE byproduct_invoices.id = byproduct_invoice_items.invoice_id
      AND byproduct_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice items for own invoices"
  ON byproduct_invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM byproduct_invoices
      WHERE byproduct_invoices.id = byproduct_invoice_items.invoice_id
      AND byproduct_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own payments"
  ON byproduct_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON byproduct_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON byproduct_payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
  ON byproduct_payments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_byproduct_rates_user_id ON byproduct_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_rates_type ON byproduct_rates(user_id, byproduct_type, is_active);

CREATE INDEX IF NOT EXISTS idx_byproduct_customers_user_id ON byproduct_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_customers_name ON byproduct_customers(user_id, name);

CREATE INDEX IF NOT EXISTS idx_byproduct_invoices_user_id ON byproduct_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_invoices_date ON byproduct_invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_byproduct_invoices_number ON byproduct_invoices(user_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_byproduct_invoices_customer ON byproduct_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_invoices_status ON byproduct_invoices(user_id, status);

CREATE INDEX IF NOT EXISTS idx_byproduct_invoice_items_invoice ON byproduct_invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_byproduct_payments_user_id ON byproduct_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_payments_invoice ON byproduct_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_byproduct_payments_date ON byproduct_payments(payment_date DESC);