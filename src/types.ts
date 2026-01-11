export type RiceType = 'raw' | 'boiled';

export interface WorkingCosts {
  electricity: number;
  labour: number;
  salaries: number;
  hamali: number;
  spares: number;
  fciExpenses: number;
  others: number;
}

export interface YieldStructure {
  headRice: number;
  brokenRice: number;
  bran: number;
  param: number;
  rejectionRice: number;
  husk: number;
}

export interface ByProduct {
  name: string;
  yieldPercent: number;
  quantity: number;
  rate: number;
  value: number;
}

export interface MillingScenario {
  paddyQuantity: number;
  riceType: RiceType;
  ricePurchaseRate: number;
  workingCosts: WorkingCosts;
  yields: YieldStructure;
  byProductRates: {
    brokenRice: number;
    bran: number;
    param: number;
    rejectionRice: number;
    husk: number;
  };
  use41KgBags: boolean;
}

export interface PurchaseScenario {
  paddyPurchaseQuantity: number;
  paddyPurchaseRate: number;
  riceSaleRate: number;
  brokenRiceSaleRate: number;
  branSaleRate: number;
  paramSaleRate: number;
  rejectionRiceSaleRate: number;
  huskSaleRate: number;
}

export interface CalculationResults {
  standardPaddy: number;
  actualPaddy: number;
  requiredRice: number;
  actualHeadRice: number;
  riceShortfall: number;
  riceShortfallCost: number;
  byProducts: ByProduct[];
  totalByProductRevenue: number;
  totalWorkingCosts: number;
  netBalance: number;
  yieldTotal: number;
}

export interface ACKCalculationResults {
  targetRice: number;
  requiredStandardPaddy: number;
  requiredActualPaddy: number;
  actualHeadRice: number;
  riceShortfall: number;
  riceShortfallCost: number;
  byProducts: ByProduct[];
  totalByProductRevenue: number;
  totalWorkingCosts: number;
  netProfit: number;
}

export interface ElectricityReading {
  id: string;
  user_id: string;
  reading_date: string;
  kwh_reading: number;
  kvah_reading: number;
  is_bill_reading: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PowerFactorCalculation {
  reading: ElectricityReading;
  kwh_diff: number;
  kvah_diff: number;
  power_factor: number;
  days_diff: number;
  previous_reading?: ElectricityReading;
  monthly_kwh_diff: number;
  monthly_kvah_diff: number;
  monthly_power_factor: number;
  monthly_days_diff: number;
  bill_reading?: ElectricityReading;
}

export interface ProductionReport {
  id: string;
  user_id: string;
  report_date: string;
  rice_type: RiceType;
  number_of_acks: number;
  raw_rice_qty: number;
  broken_rice_qty: number;
  bran_qty: number;
  param_qty: number;
  rejection_rice_qty: number;
  husk_qty: number;
  frk_qty: number;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionAnalysis {
  report: ProductionReport;
  total_output: number;
  total_rice_output: number;
  paddy_consumed: number;
  actual_yields: {
    headRice: number;
    brokenRice: number;
    bran: number;
    param: number;
    rejectionRice: number;
    husk: number;
  };
  fortified_rice_qty: number;
  fortified_rice_composition: {
    raw_rice: number;
    frk: number;
  };
}

export interface ACKProduction {
  id: string;
  user_id: string;
  ack_number: string;
  production_date: string;
  rice_type: RiceType;
  fortified_rice_qty: number;
  raw_rice_qty: number;
  frk_qty: number;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type ByProductType = 'broken_rice' | 'bran' | 'param' | 'rejection_rice' | 'husk';

export interface ByProductSale {
  id: string;
  user_id: string;
  sale_date: string;
  byproduct_type: ByProductType;
  quantity: number;
  from_ack_number: string;
  to_ack_number: string;
  ack_count: number;
  rate: number;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface YieldAnalysis {
  byproduct_type: ByProductType;
  total_quantity: number;
  total_acks: number;
  avg_per_ack: number;
  yield_percentage: number;
}

export interface ByProductRate {
  id: string;
  user_id: string;
  byproduct_type: ByProductType;
  rate: number;
  effective_from: string;
  season: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ByProductCustomer {
  id: string;
  user_id: string;
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type InvoiceType = 'tax_invoice' | 'bill_of_supply';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'cheque' | 'bank_transfer' | 'upi' | 'other';

export interface ByProductInvoice {
  id: string;
  user_id: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  invoice_date: string;
  customer_id: string | null;
  customer_name: string;
  customer_gstin: string;
  customer_address: string;
  subtotal: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  season: string;
  notes: string;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface ByProductInvoiceItem {
  id: string;
  invoice_id: string;
  byproduct_type: ByProductType;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  from_ack_number: string;
  to_ack_number: string;
  created_at: string;
}

export interface ByProductPayment {
  id: string;
  user_id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithDetails extends ByProductInvoice {
  items: ByProductInvoiceItem[];
  payments: ByProductPayment[];
  balance: number;
}

export type ItemType = 'gunnies' | 'stickers' | 'frk';
export type TransactionType = 'in' | 'out';
export type ReferenceType = 'ack_production' | 'paddy_receipt' | 'purchase' | 'manual';
export type BatchStatus = 'active' | 'depleted' | 'expired';

export interface FRKBatch {
  id: string;
  user_id: string;
  batch_number: string;
  received_date: string;
  quantity_qtls: number;
  current_stock_qtls: number;
  kernel_test_certificate_number: string;
  kernel_test_date: string | null;
  kernel_test_expiry: string | null;
  premix_test_certificate_number: string;
  premix_test_date: string | null;
  premix_test_expiry: string | null;
  supplier_name: string;
  season: string;
  notes: string;
  status: BatchStatus;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_name: string;
  current_stock: number;
  unit: string;
  reorder_level: number;
  year: string;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  user_id: string;
  item_type: ItemType;
  transaction_type: TransactionType;
  transaction_date: string;
  quantity: number;
  frk_batch_id: string | null;
  reference_type: ReferenceType;
  reference_id: string;
  from_location: string;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CMRPaddyReceipt {
  id: string;
  user_id: string;
  receipt_date: string;
  paddy_quantity_qtls: number;
  paddy_bags: number;
  gunnies_received: number;
  vehicle_number: string;
  supplier: string;
  season: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CMRRiceTarget {
  id: string;
  user_id: string;
  target_year: string;
  season: string;
  initial_target_qtls: number;
  current_balance_qtls: number;
  acks_completed: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ACKProductionConsumption {
  cmr_rice_qtls: number;
  frk_qtls: number;
  gunnies: number;
  stickers: number;
}

export interface CMRSeasonSummary {
  id: string;
  user_id: string;
  season: string;
  paddy_received_qtls: number;
  resultant_cmr_qtls: number;
  paddy_balance_qtls: number;
  cmr_balance_qtls: number;
  cmr_delivered_fci_raw: number;
  cmr_delivered_fci_boiled: number;
  cmr_delivered_central_pool: number;
  cmr_delivered_state_pool: number;
  paddy_delivered_fci_raw: number;
  paddy_delivered_fci_boiled: number;
  paddy_delivered_central_pool: number;
  paddy_delivered_state_pool: number;
  acks_fci: number;
  acks_central_pool: number;
  acks_state_pool: number;
  gate_in_fci: number;
  gate_in_central_pool: number;
  gate_in_state_pool: number;
  pending_dumping_ds_fci: number;
  pending_dumping_ds_central_pool: number;
  pending_dumping_ds_state_pool: number;
  pending_dumping_md_fci: number;
  pending_dumping_md_central_pool: number;
  pending_dumping_md_state_pool: number;
  last_updated: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  active_season: string;
  available_seasons: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Transporter {
  id: string;
  user_id: string;
  name: string;
  contact_number: string;
  address: string;
  pan_number: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type EmployeeRole = 'supervisor' | 'operator' | 'helper' | 'technician';
export type WorkType = 'loading' | 'unloading' | 'shifting' | 'stacking';
export type HamaliMaterialType = 'paddy' | 'rice' | 'byproduct' | 'frk' | 'gunny' | 'other';

export interface LorryFreight {
  id: string;
  user_id: string;
  season: string;
  ack_number: string;
  delivery_date: string;
  vehicle_number: string;
  transporter_id: string | null;
  transporter_name: string;
  quantity_qtls: number;
  freight_rate: number;
  total_freight: number;
  advance_paid: number;
  balance_due: number;
  payment_status: PaymentStatus;
  destination: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TransporterDues {
  transporter_id: string;
  transporter_name: string;
  total_freight: number;
  total_paid: number;
  balance_due: number;
  delivery_count: number;
}

export interface SupervisorWages {
  id: string;
  user_id: string;
  season: string;
  employee_name: string;
  role: EmployeeRole;
  payment_date: string;
  period_start: string | null;
  period_end: string | null;
  base_salary: number;
  ack_bonus: number;
  acks_completed: number;
  overtime_hours: number;
  overtime_amount: number;
  deductions: number;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface HamaliWork {
  id: string;
  user_id: string;
  season: string;
  work_date: string;
  work_type: WorkType;
  worker_name: string;
  material_type: HamaliMaterialType;
  quantity_qtls: number;
  bags_count: number;
  rate_per_qtl: number;
  rate_per_bag: number;
  total_amount: number;
  ack_reference: string;
  payment_status: PaymentStatus;
  payment_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}
