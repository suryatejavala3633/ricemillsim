# Complete Rice Mill Management System - Project Prompt

Build a comprehensive, production-ready Rice Mill Management System for CMR (Custom Milled Rice) operations with a beautiful, modern, dark-themed interface using React, TypeScript, Vite, Tailwind CSS, and Supabase.

---

## 🎨 DESIGN REQUIREMENTS

### Visual Theme & Aesthetics
- **Background**: Deep dark theme with `bg-[#0a0a0a]` base
- **Cards & Panels**: Semi-transparent cards with `bg-white/[0.02]` backdrop blur effects and `border-white/10` borders
- **Typography**: Clean, professional fonts with proper hierarchy
  - Page titles: 2xl-3xl, bold, white text
  - Section headers: xl-2xl, semibold
  - Body text: Gray-300 to Gray-400 for readability
- **Color Palette**:
  - Primary Actions: Emerald-500/600 (success, add)
  - Secondary Actions: Blue-500/600 (info, view)
  - Warning/Alerts: Amber-500/600
  - Danger/Delete: Red-500/600
  - Special Features: Purple-500/600 (imports)
  - Neutral: Slate and Gray shades
- **Shadows**: Use colored shadows like `shadow-lg shadow-blue-500/20` for depth
- **Animations**: Smooth transitions on all interactive elements (hover, active states)
- **Rounded Corners**: xl-2xl border radius for modern feel
- **Icons**: Use Lucide React icons throughout
- **Responsive Design**: Mobile-first, works beautifully on all screen sizes
- **Glass Morphism**: Backdrop blur effects on modals and overlays

---

## 🔐 AUTHENTICATION SYSTEM

**Use Supabase Email/Password Authentication:**
- Login, Sign Up, and Password Reset pages
- Secure authentication flow
- Session management
- Protected routes (redirect to login if not authenticated)
- Loading states during auth checks
- Row Level Security (RLS) on ALL database tables
- User context provider for global auth state

---

## 📊 MAIN APPLICATION TABS

### Tab 1: CMR Paddy Dashboard
**Purpose**: Track paddy receipts and CMR rice deliveries to FCI/Pools

**Features**:
- **Season Tracking**: Active season selector, view season statistics
- **Paddy Receipts**: Record incoming paddy with quantity, bags, gunnies, vehicle number, supplier
- **CMR Deliveries**: Record ACK deliveries with:
  - ACK number (e.g., R 24-25/522898)
  - Delivery date, destination (FCI/Central Pool/State Pool)
  - Variety (Raw/Boiled)
  - CMR quantity (quintals)
  - Paddy consumed (quintals)
  - Vehicle number, driver name
  - Delivery status
  - Gate-in status and date
  - Dumping status (completed, pending DS, pending MD)
- **Import Feature**: "Import 99 ACKs" button to bulk import pre-defined CMR delivery data
  - Imports to: CMR Deliveries, Production Tab, and Lorry Freight Tab
  - Shows progress bar during import
  - Summary results after completion
- **Season Statistics Dashboard**:
  - Total paddy received
  - Resultant CMR produced
  - Paddy balance
  - CMR balance
  - Deliveries by destination (FCI Raw/Boiled, Central Pool, State Pool)
  - ACK counts
  - Gate-in statistics
  - Pending dumping (DS and MD) by destination
- **Data Tables**:
  - View all receipts and deliveries
  - Filter by date, destination, status
  - Edit and delete capabilities
  - Export to Excel/PDF

### Tab 2: Production Tracker
**Purpose**: Track daily ACK production with fortified rice composition

**Features**:
- **ACK Production Records**:
  - ACK number
  - Production date
  - Rice type (Raw/Boiled)
  - Fortified rice quantity (290 Qtls per ACK standard)
  - Raw rice quantity
  - FRK (Fortified Rice Kernel) quantity
  - Season tracking
  - Notes
- **Production Analysis**:
  - Total production by season
  - Average quantities per ACK
  - FRK consumption tracking
  - Production trends
- **Data Grid**: View, edit, delete production records
- **Filters**: By date range, season, rice type, ACK number
- **Export**: Excel and PDF reports

### Tab 3: Lorry Freight Manager
**Purpose**: Manage transportation costs and transporter payments

**Features**:
- **Freight Records**:
  - ACK number
  - Delivery date
  - Vehicle number
  - Transporter name
  - Quantity (quintals)
  - Freight rate per quintal
  - Total freight amount
  - Advance paid
  - Balance due
  - Payment status (Pending/Partial/Paid)
  - Destination
- **Transporter Master**: Manage transporter details (name, contact, PAN, address)
- **Payment Tracking**:
  - Outstanding dues by transporter
  - Payment history
  - Total freight vs. paid analysis
- **Summary Cards**:
  - Total freight for season
  - Total paid
  - Outstanding balance
  - Number of deliveries
- **Data Grid**: Sortable, filterable table with edit/delete
- **Export**: Financial reports

### Tab 4: Wages Manager
**Purpose**: Track employee wages and payments

**Features**:
- **Supervisor/Employee Wages**:
  - Employee name and role (Supervisor, Operator, Helper, Technician)
  - Payment date
  - Period (start and end date)
  - Base salary
  - ACK bonus (based on ACKs completed)
  - Overtime hours and amount
  - Deductions
  - Total amount
  - Payment method (Cash, Bank Transfer, UPI, Cheque)
  - Payment status
- **Summary Dashboard**:
  - Total wages paid in season
  - Pending payments
  - Employee-wise breakdown
  - Role-wise analysis
- **Data Management**: Add, edit, delete wage records
- **Export**: Payroll reports

### Tab 5: Hamali Work Manager
**Purpose**: Track loading/unloading labor work and costs

**Features**:
- **Hamali Work Records**:
  - Work date
  - Work type (Loading, Unloading, Shifting, Stacking)
  - Worker name
  - Material type (Paddy, Rice, Byproduct, FRK, Gunny, Other)
  - Quantity in quintals
  - Bags count
  - Rate per quintal
  - Rate per bag
  - Total amount
  - ACK reference
  - Payment status and date
- **Worker Summary**:
  - Total work by worker
  - Outstanding payments
  - Work type analysis
- **Financial Overview**:
  - Total hamali costs
  - Paid vs. pending
  - Material-wise costs
- **Data Grid**: Full CRUD operations
- **Export**: Labor cost reports

### Tab 6: Inventory Manager
**Purpose**: Track gunnies, stickers, and FRK stock

**Features**:
- **Stock Items**:
  - Item type (Gunnies, Stickers, FRK)
  - Current stock levels
  - Unit of measurement
  - Reorder level (low stock alerts)
  - Year and season tracking
- **FRK Batch Management**:
  - Batch number
  - Received date
  - Quantity received (quintals)
  - Current stock (quintals)
  - Kernel Test Certificate (number, date, expiry)
  - Premix Test Certificate (number, date, expiry)
  - Supplier name
  - Batch status (Active, Depleted, Expired)
  - Color-coded expiry alerts (red if expired within 30 days)
- **Stock Transactions**:
  - Transaction type (In/Out)
  - Transaction date
  - Quantity
  - Reference (ACK production, Paddy receipt, Purchase, Manual)
  - From location
  - Notes
- **Dashboard Cards**:
  - Current stock levels with visual indicators
  - Low stock warnings
  - Active FRK batches count
  - Expiring certificates alerts
- **Consumption Analysis**:
  - FRK consumption per ACK
  - Gunny usage per ACK
  - Stock movement trends
- **Data Tables**: View, add, edit inventory
- **Export**: Inventory reports

### Tab 7: By-Product Sales Manager
**Purpose**: Manage sales of rice by-products (Broken Rice, Bran, Param, Rejection Rice, Husk)

**Features**:
- **By-Product Sales Records**:
  - Sale date
  - By-product type
  - Quantity
  - From ACK number
  - To ACK number
  - ACK count (number of ACKs covered)
  - Rate per unit
  - Total value
  - Season
- **Rate Management**:
  - Set current rates for each by-product
  - Rate history tracking
  - Effective from dates
  - Active/inactive status
- **Customer Management**:
  - Customer name, GSTIN
  - Address, phone, email
  - Customer-wise sales history
- **Invoice Generation**:
  - Tax Invoice or Bill of Supply
  - Auto-incrementing invoice numbers
  - Multiple line items per invoice
  - CGST, SGST, IGST calculations
  - Invoice status (Draft, Issued, Paid, Cancelled)
  - Print/PDF generation
- **Payment Tracking**:
  - Payment date, amount
  - Payment method (Cash, Cheque, Bank Transfer, UPI, Other)
  - Reference number
  - Link payments to invoices
  - Outstanding balance calculation
- **Yield Analysis**:
  - By-product quantity per ACK
  - Yield percentages
  - Comparison across seasons
- **Financial Summary**:
  - Total by-product revenue
  - Revenue by product type
  - Outstanding receivables
  - Customer-wise dues
- **Data Tables**: CRUD operations for sales, rates, customers, invoices
- **Export**: Sales reports, GST reports, customer statements

### Tab 8: Pricing List
**Purpose**: View and update current market rates for all products

**Features**:
- Display current rates for:
  - Head Rice
  - Broken Rice
  - Bran
  - Param
  - Rejection Rice
  - Husk
  - FRK
  - Working costs (Electricity, Labour, Salaries, Hamali, Spares, FCI Expenses, Others)
- Editable rate cards with save functionality
- Rate history tracking
- Season-wise rate comparison
- Visual cards with proper formatting (₹ symbol, decimal places)

### Tab 9: Power Factor Tracker
**Purpose**: Monitor electricity consumption and power factor

**Features**:
- **Electricity Readings**:
  - Reading date
  - KWH reading
  - KVAH reading
  - Bill reading flag
  - Notes
- **Power Factor Calculation**:
  - Automatic calculation between readings
  - Daily power factor
  - Monthly power factor (from bill to bill)
  - Days difference
  - KWH and KVAH consumption
- **Visual Dashboard**:
  - Power factor trend graph
  - Current power factor display
  - Target power factor indicator (>0.92 is good)
  - Color-coded indicators (green, amber, red)
- **Summary Cards**:
  - Latest reading details
  - Monthly consumption
  - Cost implications
- **Data Table**: View, add, edit readings
- **Export**: Electricity consumption reports

### Tab 10: Calculator (Milling Scenario)
**Purpose**: Calculate profitability for different milling scenarios

**Features**:
- **Input Parameters**:
  - Paddy quantity (quintals)
  - Rice type (Raw/Boiled)
  - Rice purchase rate
  - Working costs breakdown
  - Yield structure (Head Rice %, Broken Rice %, Bran %, Param %, Rejection %, Husk %)
  - By-product rates
  - Bag type (41 kg or 50 kg)
- **Calculations**:
  - Standard paddy (33.33% moisture adjustment)
  - Actual paddy needed
  - Required rice output
  - Actual head rice produced
  - Rice shortfall (if any)
  - Shortfall cost
  - By-product quantities and revenues
  - Total working costs
  - Net balance (profit/loss)
  - Yield total verification
- **Results Display**:
  - Visual cards showing all calculated values
  - Color coding (green for profit, red for loss)
  - By-products breakdown table
  - Financial summary
- **Save Scenarios**: Save and load different scenarios for comparison
- **Export**: Scenario results to PDF/Excel

### Tab 11: ACK Calculator
**Purpose**: Calculate costs and profitability for single ACK production

**Features**:
- **Target Parameters**:
  - Target rice quantity (default 290 quintals)
  - Rice type selection
  - Yield structure
  - By-product rates
  - Working costs
- **Calculations**:
  - Required standard paddy
  - Required actual paddy
  - Actual head rice produced
  - Rice shortfall and cost
  - By-product revenues
  - Total working costs
  - Net profit per ACK
- **Results Display**: Clear visual presentation of all calculations
- **Scenario Comparison**: Compare different yield structures
- **Export**: ACK cost analysis reports

### Tab 12: Purchase Analysis
**Purpose**: Analyze the financial viability of paddy purchases

**Features**:
- **Purchase Scenario Inputs**:
  - Paddy purchase quantity
  - Paddy purchase rate
  - Expected rice sale rate
  - Expected by-product sale rates
- **Analysis**:
  - Total purchase cost
  - Expected rice output
  - Expected by-product outputs
  - Total expected revenue
  - Gross profit
  - Profit margin percentage
  - Break-even analysis
- **Comparison**: Compare multiple purchase scenarios
- **Recommendation**: Buy/Don't Buy suggestion based on profit margin
- **Export**: Purchase analysis reports

---

## 🗄️ DATABASE STRUCTURE (Supabase)

### Tables Required:

1. **ack_production**
   - id, user_id, ack_number, production_date, rice_type, fortified_rice_qty, raw_rice_qty, frk_qty, season, notes, created_at, updated_at

2. **cmr_deliveries**
   - id, user_id, ack_number, delivery_date, destination_pool, variety, cmr_quantity_qtls, paddy_consumed_qtls, vehicle_number, driver_name, delivery_status, gate_in_status, gate_in_date, dumping_status, season, notes, created_at, updated_at

3. **cmr_paddy_receipts**
   - id, user_id, receipt_date, paddy_quantity_qtls, paddy_bags, gunnies_received, vehicle_number, supplier, season, notes, created_at, updated_at

4. **cmr_season_summary**
   - id, user_id, season, paddy_received_qtls, resultant_cmr_qtls, paddy_balance_qtls, cmr_balance_qtls, cmr_delivered_fci_raw, cmr_delivered_fci_boiled, cmr_delivered_central_pool, cmr_delivered_state_pool, paddy_delivered_fci_raw, paddy_delivered_fci_boiled, paddy_delivered_central_pool, paddy_delivered_state_pool, acks_fci, acks_central_pool, acks_state_pool, gate_in_fci, gate_in_central_pool, gate_in_state_pool, pending_dumping_ds_fci, pending_dumping_ds_central_pool, pending_dumping_ds_state_pool, pending_dumping_md_fci, pending_dumping_md_central_pool, pending_dumping_md_state_pool, last_updated, notes, created_at, updated_at

5. **electricity_readings**
   - id, user_id, reading_date, kwh_reading, kvah_reading, is_bill_reading, notes, created_at, updated_at

6. **byproduct_sales**
   - id, user_id, sale_date, byproduct_type, quantity, from_ack_number, to_ack_number, ack_count, rate, season, notes, created_at, updated_at

7. **byproduct_rates**
   - id, user_id, byproduct_type, rate, effective_from, season, notes, is_active, created_at, updated_at

8. **byproduct_customers**
   - id, user_id, name, gstin, address, phone, email, season, notes, created_at, updated_at

9. **byproduct_invoices**
   - id, user_id, invoice_number, invoice_type, invoice_date, customer_id, customer_name, customer_gstin, customer_address, subtotal, cgst_rate, sgst_rate, igst_rate, cgst_amount, sgst_amount, igst_amount, total_amount, season, notes, status, created_at, updated_at

10. **byproduct_invoice_items**
    - id, invoice_id, byproduct_type, description, quantity, rate, amount, from_ack_number, to_ack_number, created_at

11. **byproduct_payments**
    - id, user_id, invoice_id, payment_date, amount, payment_method, reference_number, season, notes, created_at, updated_at

12. **frk_batches**
    - id, user_id, batch_number, received_date, quantity_qtls, current_stock_qtls, kernel_test_certificate_number, kernel_test_date, kernel_test_expiry, premix_test_certificate_number, premix_test_date, premix_test_expiry, supplier_name, season, notes, status, created_at, updated_at

13. **stock_items**
    - id, user_id, item_type, item_name, current_stock, unit, reorder_level, year, season, notes, created_at, updated_at

14. **stock_transactions**
    - id, user_id, item_type, transaction_type, transaction_date, quantity, frk_batch_id, reference_type, reference_id, from_location, season, notes, created_at, updated_at

15. **lorry_freight**
    - id, user_id, season, ack_number, delivery_date, vehicle_number, transporter_id, transporter_name, quantity_qtls, freight_rate, total_freight, advance_paid, balance_due, payment_status, destination, notes, created_at, updated_at

16. **transporters**
    - id, user_id, name, contact_number, address, pan_number, notes, is_active, created_at, updated_at

17. **supervisor_wages**
    - id, user_id, season, employee_name, role, payment_date, period_start, period_end, base_salary, ack_bonus, acks_completed, overtime_hours, overtime_amount, deductions, total_amount, payment_method, payment_status, notes, created_at, updated_at

18. **hamali_work**
    - id, user_id, season, work_date, work_type, worker_name, material_type, quantity_qtls, bags_count, rate_per_qtl, rate_per_bag, total_amount, ack_reference, payment_status, payment_date, notes, created_at, updated_at

19. **user_settings**
    - id, user_id, active_season, available_seasons (array), settings (jsonb), created_at, updated_at

### Row Level Security (RLS):
- **Enable RLS on ALL tables**
- **Policies**: Users can only access their own data (WHERE user_id = auth.uid())
- **SELECT, INSERT, UPDATE, DELETE** policies for each table
- **Authenticated users only** - no public access

---

## 📦 PRE-LOADED DATA: 99 CMR ACK DELIVERIES

Include an "Import 99 ACKs" feature with these exact records:

```javascript
const CMR_DELIVERIES = [
  { ackNumber: 'R 24-25/522898', dispatchDate: '2025-06-05', vehicleNumber: 'AP29TB8258', netRiceQty: 286.66931, frkQty: 2.86669, gateInDate: '2025-06-06', dumpingDate: '2025-06-07' },
  { ackNumber: 'R 24-25/523849', dispatchDate: '2025-06-06', vehicleNumber: 'AP28TE3355', netRiceQty: 286.28086, frkQty: 2.8657, gateInDate: '2025-06-06', dumpingDate: '2025-06-09' },
  { ackNumber: 'R 24-25/525002', dispatchDate: '2025-06-08', vehicleNumber: 'AP29V7825', netRiceQty: 285.01812, frkQty: 2.86174, gateInDate: '2025-06-09', dumpingDate: '2025-06-09' },
  { ackNumber: 'R 24-25/526225', dispatchDate: '2025-06-09', vehicleNumber: 'AP28TB3365', netRiceQty: 286.06924, frkQty: 2.86069, gateInDate: '2025-06-10', dumpingDate: '2025-06-11' },
  { ackNumber: 'R 24-25/527388', dispatchDate: '2025-06-10', vehicleNumber: 'TN04C1925', netRiceQty: 286.01924, frkQty: 2.86192, gateInDate: '2025-06-11', dumpingDate: '2025-06-12' },
  { ackNumber: 'R 24-25/528514', dispatchDate: '2025-06-11', vehicleNumber: 'AP28TD8874', netRiceQty: 286.04932, frkQty: 2.85951, gateInDate: '2025-06-12', dumpingDate: '2025-06-13' },
  { ackNumber: 'R 24-25/529682', dispatchDate: '2025-06-12', vehicleNumber: 'AP29TE4568', netRiceQty: 286.23945, frkQty: 2.86076, gateInDate: '2025-06-13', dumpingDate: '2025-06-14' },
  { ackNumber: 'R 24-25/530841', dispatchDate: '2025-06-13', vehicleNumber: 'AP39U4758', netRiceQty: 286.18932, frkQty: 2.86107, gateInDate: '2025-06-14', dumpingDate: '2025-06-16' },
  { ackNumber: 'R 24-25/531956', dispatchDate: '2025-06-14', vehicleNumber: 'AP29AV1284', netRiceQty: 285.98123, frkQty: 2.86019, gateInDate: '2025-06-15', dumpingDate: '2025-06-17' },
  { ackNumber: 'R 24-25/533124', dispatchDate: '2025-06-15', vehicleNumber: 'AP28TC6547', netRiceQty: 286.21834, frkQty: 2.85978, gateInDate: '2025-06-16', dumpingDate: '2025-06-18' },
  { ackNumber: 'R 24-25/534289', dispatchDate: '2025-06-16', vehicleNumber: 'TN09W2547', netRiceQty: 286.11945, frkQty: 2.86189, gateInDate: '2025-06-17', dumpingDate: '2025-06-19' },
  { ackNumber: 'R 24-25/535412', dispatchDate: '2025-06-17', vehicleNumber: 'AP28TE9658', netRiceQty: 285.94871, frkQty: 2.86051, gateInDate: '2025-06-18', dumpingDate: '2025-06-20' },
  { ackNumber: 'R 24-25/536587', dispatchDate: '2025-06-18', vehicleNumber: 'AP29TB2589', netRiceQty: 286.08935, frkQty: 2.86109, gateInDate: '2025-06-19', dumpingDate: '2025-06-21' },
  { ackNumber: 'R 24-25/537714', dispatchDate: '2025-06-19', vehicleNumber: 'AP28TD1258', netRiceQty: 286.19847, frkQty: 2.86098, gateInDate: '2025-06-20', dumpingDate: '2025-06-23' },
  { ackNumber: 'R 24-25/538893', dispatchDate: '2025-06-20', vehicleNumber: 'AP39T8547', netRiceQty: 286.04912, frkQty: 2.86149, gateInDate: '2025-06-21', dumpingDate: '2025-06-24' },
  { ackNumber: 'R 24-25/540021', dispatchDate: '2025-06-21', vehicleNumber: 'TN03AV4587', netRiceQty: 285.97823, frkQty: 2.86098, gateInDate: '2025-06-23', dumpingDate: '2025-06-25' },
  { ackNumber: 'R 24-25/541185', dispatchDate: '2025-06-23', vehicleNumber: 'AP28TE6547', netRiceQty: 286.14956, frkQty: 2.86051, gateInDate: '2025-06-24', dumpingDate: '2025-06-26' },
  { ackNumber: 'R 24-25/542326', dispatchDate: '2025-06-24', vehicleNumber: 'AP29TC3698', netRiceQty: 286.23874, frkQty: 2.86126, gateInDate: '2025-06-25', dumpingDate: '2025-06-27' },
  { ackNumber: 'R 24-25/543478', dispatchDate: '2025-06-25', vehicleNumber: 'AP28TB5874', netRiceQty: 286.09835, frkQty: 2.86091, gateInDate: '2025-06-26', dumpingDate: '2025-06-28' },
  { ackNumber: 'R 24-25/544612', dispatchDate: '2025-06-26', vehicleNumber: 'AP39U1587', netRiceQty: 285.96741, frkQty: 2.86033, gateInDate: '2025-06-27', dumpingDate: '2025-06-30' },
  { ackNumber: 'R 24-25/545789', dispatchDate: '2025-06-27', vehicleNumber: 'TN10BV8547', netRiceQty: 286.18923, frkQty: 2.86108, gateInDate: '2025-06-28', dumpingDate: '2025-07-01' },
  { ackNumber: 'R 24-25/546914', dispatchDate: '2025-06-28', vehicleNumber: 'AP28TD9658', netRiceQty: 286.04871, frkQty: 2.86049, gateInDate: '2025-06-30', dumpingDate: '2025-07-02' },
  { ackNumber: 'R 24-25/548087', dispatchDate: '2025-06-30', vehicleNumber: 'AP29TE1247', netRiceQty: 286.21945, frkQty: 2.86122, gateInDate: '2025-07-01', dumpingDate: '2025-07-03' },
  { ackNumber: 'R 24-25/549214', dispatchDate: '2025-07-01', vehicleNumber: 'AP28TC8574', netRiceQty: 285.98634, frkQty: 2.86099, gateInDate: '2025-07-02', dumpingDate: '2025-07-04' },
  { ackNumber: 'R 24-25/550389', dispatchDate: '2025-07-02', vehicleNumber: 'AP39T2589', netRiceQty: 286.14823, frkQty: 2.86051, gateInDate: '2025-07-03', dumpingDate: '2025-07-05' },
  { ackNumber: 'R 24-25/551523', dispatchDate: '2025-07-03', vehicleNumber: 'TN04C8547', netRiceQty: 286.07912, frkQty: 2.86107, gateInDate: '2025-07-04', dumpingDate: '2025-07-07' },
  { ackNumber: 'R 24-25/552687', dispatchDate: '2025-07-04', vehicleNumber: 'AP28TE3698', netRiceQty: 286.19845, frkQty: 2.86098, gateInDate: '2025-07-05', dumpingDate: '2025-07-08' },
  { ackNumber: 'R 24-25/553814', dispatchDate: '2025-07-05', vehicleNumber: 'AP29TB7412', netRiceQty: 285.96734, frkQty: 2.86033, gateInDate: '2025-07-07', dumpingDate: '2025-07-09' },
  { ackNumber: 'R 24-25/554978', dispatchDate: '2025-07-07', vehicleNumber: 'AP28TD4589', netRiceQty: 286.23916, frkQty: 2.86124, gateInDate: '2025-07-08', dumpingDate: '2025-07-10' },
  { ackNumber: 'R 24-25/556123', dispatchDate: '2025-07-08', vehicleNumber: 'AP39U6547', netRiceQty: 286.11834, frkQty: 2.86088, gateInDate: '2025-07-09', dumpingDate: '2025-07-11' },
  { ackNumber: 'R 24-25/557289', dispatchDate: '2025-07-09', vehicleNumber: 'TN09W7584', netRiceQty: 286.04921, frkQty: 2.86149, gateInDate: '2025-07-10', dumpingDate: '2025-07-12' },
  { ackNumber: 'R 24-25/558412', dispatchDate: '2025-07-10', vehicleNumber: 'AP28TE8574', netRiceQty: 286.18935, frkQty: 2.86109, gateInDate: '2025-07-11', dumpingDate: '2025-07-14' },
  { ackNumber: 'R 24-25/559587', dispatchDate: '2025-07-11', vehicleNumber: 'AP29TC5874', netRiceQty: 285.97812, frkQty: 2.86098, gateInDate: '2025-07-12', dumpingDate: '2025-07-15' },
  { ackNumber: 'R 24-25/560714', dispatchDate: '2025-07-12', vehicleNumber: 'AP28TB9658', netRiceQty: 286.14947, frkQty: 2.86051, gateInDate: '2025-07-14', dumpingDate: '2025-07-16' },
  { ackNumber: 'R 24-25/561893', dispatchDate: '2025-07-14', vehicleNumber: 'AP39T1258', netRiceQty: 286.08923, frkQty: 2.86109, gateInDate: '2025-07-15', dumpingDate: '2025-07-17' },
  { ackNumber: 'R 24-25/563021', dispatchDate: '2025-07-15', vehicleNumber: 'TN03AV2587', netRiceQty: 286.21856, frkQty: 2.86122, gateInDate: '2025-07-16', dumpingDate: '2025-07-18' },
  { ackNumber: 'R 24-25/564185', dispatchDate: '2025-07-16', vehicleNumber: 'AP28TE1258', netRiceQty: 285.96745, frkQty: 2.86033, gateInDate: '2025-07-17', dumpingDate: '2025-07-19' },
  { ackNumber: 'R 24-25/565326', dispatchDate: '2025-07-17', vehicleNumber: 'AP29TB4589', netRiceQty: 286.19834, frkQty: 2.86098, gateInDate: '2025-07-18', dumpingDate: '2025-07-21' },
  { ackNumber: 'R 24-25/566478', dispatchDate: '2025-07-18', vehicleNumber: 'AP28TD6547', netRiceQty: 286.04912, frkQty: 2.86049, gateInDate: '2025-07-19', dumpingDate: '2025-07-22' },
  { ackNumber: 'R 24-25/567612', dispatchDate: '2025-07-19', vehicleNumber: 'AP39U3698', netRiceQty: 286.23945, frkQty: 2.86124, gateInDate: '2025-07-21', dumpingDate: '2025-07-23' },
  { ackNumber: 'R 24-25/568789', dispatchDate: '2025-07-21', vehicleNumber: 'TN10BV5874', netRiceQty: 286.11823, frkQty: 2.86088, gateInDate: '2025-07-22', dumpingDate: '2025-07-24' },
  { ackNumber: 'R 24-25/569914', dispatchDate: '2025-07-22', vehicleNumber: 'AP28TE7412', netRiceQty: 285.97834, frkQty: 2.86098, gateInDate: '2025-07-23', dumpingDate: '2025-07-25' },
  { ackNumber: 'R 24-25/571087', dispatchDate: '2025-07-23', vehicleNumber: 'AP29TC8574', netRiceQty: 286.18912, frkQty: 2.86109, gateInDate: '2025-07-24', dumpingDate: '2025-07-26' },
  { ackNumber: 'R 24-25/572214', dispatchDate: '2025-07-24', vehicleNumber: 'AP28TB1258', netRiceQty: 286.04891, frkQty: 2.86049, gateInDate: '2025-07-25', dumpingDate: '2025-07-28' },
  { ackNumber: 'R 24-25/573389', dispatchDate: '2025-07-25', vehicleNumber: 'AP39T4589', netRiceQty: 286.21934, frkQty: 2.86122, gateInDate: '2025-07-26', dumpingDate: '2025-07-29' },
  { ackNumber: 'R 24-25/574523', dispatchDate: '2025-07-26', vehicleNumber: 'TN04C6547', netRiceQty: 285.96756, frkQty: 2.86033, gateInDate: '2025-07-28', dumpingDate: '2025-07-30' },
  { ackNumber: 'R 24-25/575687', dispatchDate: '2025-07-28', vehicleNumber: 'AP28TE9658', netRiceQty: 286.14845, frkQty: 2.86051, gateInDate: '2025-07-29', dumpingDate: '2025-07-31' },
  { ackNumber: 'R 24-25/576814', dispatchDate: '2025-07-29', vehicleNumber: 'AP29TB2589', netRiceQty: 286.08934, frkQty: 2.86109, gateInDate: '2025-07-30', dumpingDate: '2025-08-01' },
  { ackNumber: 'R 24-25/577978', dispatchDate: '2025-07-30', vehicleNumber: 'AP28TD5874', netRiceQty: 286.19823, frkQty: 2.86098, gateInDate: '2025-07-31', dumpingDate: '2025-08-02' },
  { ackNumber: 'R 24-25/579123', dispatchDate: '2025-07-31', vehicleNumber: 'AP39U8547', netRiceQty: 285.97845, frkQty: 2.86098, gateInDate: '2025-08-01', dumpingDate: '2025-08-04' },
  { ackNumber: 'R 24-25/580289', dispatchDate: '2025-08-01', vehicleNumber: 'TN09W3698', netRiceQty: 286.23956, frkQty: 2.86124, gateInDate: '2025-08-02', dumpingDate: '2025-08-05' },
  { ackNumber: 'R 24-25/581412', dispatchDate: '2025-08-02', vehicleNumber: 'AP28TE4589', netRiceQty: 286.11834, frkQty: 2.86088, gateInDate: '2025-08-04', dumpingDate: '2025-08-06' },
  { ackNumber: 'R 24-25/582587', dispatchDate: '2025-08-04', vehicleNumber: 'AP29TC1258', netRiceQty: 286.04923, frkQty: 2.86049, gateInDate: '2025-08-05', dumpingDate: '2025-08-07' },
  { ackNumber: 'R 24-25/583714', dispatchDate: '2025-08-05', vehicleNumber: 'AP28TB6547', netRiceQty: 286.18945, frkQty: 2.86109, gateInDate: '2025-08-06', dumpingDate: '2025-08-08' },
  { ackNumber: 'R 24-25/584893', dispatchDate: '2025-08-06', vehicleNumber: 'AP39T7412', netRiceQty: 285.96734, frkQty: 2.86033, gateInDate: '2025-08-07', dumpingDate: '2025-08-09' },
  { ackNumber: 'R 24-25/586021', dispatchDate: '2025-08-07', vehicleNumber: 'TN03AV8574', netRiceQty: 286.21923, frkQty: 2.86122, gateInDate: '2025-08-08', dumpingDate: '2025-08-11' },
  { ackNumber: 'R 24-25/587185', dispatchDate: '2025-08-08', vehicleNumber: 'AP28TE5874', netRiceQty: 286.14856, frkQty: 2.86051, gateInDate: '2025-08-09', dumpingDate: '2025-08-12' },
  { ackNumber: 'R 24-25/588326', dispatchDate: '2025-08-09', vehicleNumber: 'AP29TB9658', netRiceQty: 286.08912, frkQty: 2.86109, gateInDate: '2025-08-11', dumpingDate: '2025-08-13' },
  { ackNumber: 'R 24-25/589478', dispatchDate: '2025-08-11', vehicleNumber: 'AP28TD1258', netRiceQty: 286.19834, frkQty: 2.86098, gateInDate: '2025-08-12', dumpingDate: '2025-08-14' },
  { ackNumber: 'R 24-25/590612', dispatchDate: '2025-08-12', vehicleNumber: 'AP39U2587', netRiceQty: 285.97823, frkQty: 2.86098, gateInDate: '2025-08-13', dumpingDate: '2025-08-15' },
  { ackNumber: 'R 24-25/591789', dispatchDate: '2025-08-13', vehicleNumber: 'TN10BV4589', netRiceQty: 286.23934, frkQty: 2.86124, gateInDate: '2025-08-14', dumpingDate: '2025-08-16' },
  { ackNumber: 'R 24-25/592914', dispatchDate: '2025-08-14', vehicleNumber: 'AP28TE6547', netRiceQty: 286.11845, frkQty: 2.86088, gateInDate: '2025-08-15', dumpingDate: '2025-08-18' },
  { ackNumber: 'R 24-25/594087', dispatchDate: '2025-08-15', vehicleNumber: 'AP29TC3698', netRiceQty: 286.04901, frkQty: 2.86049, gateInDate: '2025-08-16', dumpingDate: '2025-08-19' },
  { ackNumber: 'R 24-25/595214', dispatchDate: '2025-08-16', vehicleNumber: 'AP28TB8574', netRiceQty: 286.18923, frkQty: 2.86109, gateInDate: '2025-08-18', dumpingDate: '2025-08-20' },
  { ackNumber: 'R 24-25/596389', dispatchDate: '2025-08-18', vehicleNumber: 'AP39T5874', netRiceQty: 285.96745, frkQty: 2.86033, gateInDate: '2025-08-19', dumpingDate: '2025-08-21' },
  { ackNumber: 'R 24-25/597523', dispatchDate: '2025-08-19', vehicleNumber: 'TN04C1258', netRiceQty: 286.21912, frkQty: 2.86122, gateInDate: '2025-08-20', dumpingDate: '2025-08-22' },
  { ackNumber: 'R 24-25/598687', dispatchDate: '2025-08-20', vehicleNumber: 'AP28TE2587', netRiceQty: 286.14834, frkQty: 2.86051, gateInDate: '2025-08-21', dumpingDate: '2025-08-23' },
  { ackNumber: 'R 24-25/599814', dispatchDate: '2025-08-21', vehicleNumber: 'AP29TB4589', netRiceQty: 286.08923, frkQty: 2.86109, gateInDate: '2025-08-22', dumpingDate: '2025-08-25' },
  { ackNumber: 'R 24-25/600978', dispatchDate: '2025-08-22', vehicleNumber: 'AP28TD6547', netRiceQty: 286.19845, frkQty: 2.86098, gateInDate: '2025-08-23', dumpingDate: '2025-08-26' },
  { ackNumber: 'R 24-25/602123', dispatchDate: '2025-08-23', vehicleNumber: 'AP39U9658', netRiceQty: 285.97834, frkQty: 2.86098, gateInDate: '2025-08-25', dumpingDate: '2025-08-27' },
  { ackNumber: 'R 24-25/603289', dispatchDate: '2025-08-25', vehicleNumber: 'TN09W7412', netRiceQty: 286.23945, frkQty: 2.86124, gateInDate: '2025-08-26', dumpingDate: '2025-08-28' },
  { ackNumber: 'R 24-25/604412', dispatchDate: '2025-08-26', vehicleNumber: 'AP28TE8574', netRiceQty: 286.11823, frkQty: 2.86088, gateInDate: '2025-08-27', dumpingDate: '2025-08-29' },
  { ackNumber: 'R 24-25/605587', dispatchDate: '2025-08-27', vehicleNumber: 'AP29TC5874', netRiceQty: 286.04912, frkQty: 2.86049, gateInDate: '2025-08-28', dumpingDate: '2025-08-30' },
  { ackNumber: 'R 24-25/606714', dispatchDate: '2025-08-28', vehicleNumber: 'AP28TB1258', netRiceQty: 286.18934, frkQty: 2.86109, gateInDate: '2025-08-29', dumpingDate: '2025-09-01' },
  { ackNumber: 'R 24-25/607893', dispatchDate: '2025-08-29', vehicleNumber: 'AP39T2587', netRiceQty: 285.96756, frkQty: 2.86033, gateInDate: '2025-08-30', dumpingDate: '2025-09-02' },
  { ackNumber: 'R 24-25/609021', dispatchDate: '2025-08-30', vehicleNumber: 'TN03AV4589', netRiceQty: 286.21901, frkQty: 2.86122, gateInDate: '2025-09-01', dumpingDate: '2025-09-03' },
  { ackNumber: 'R 24-25/610185', dispatchDate: '2025-09-01', vehicleNumber: 'AP28TE6547', netRiceQty: 286.14845, frkQty: 2.86051, gateInDate: '2025-09-02', dumpingDate: '2025-09-04' },
  { ackNumber: 'R 24-25/611326', dispatchDate: '2025-09-02', vehicleNumber: 'AP29TB9658', netRiceQty: 286.08901, frkQty: 2.86109, gateInDate: '2025-09-03', dumpingDate: '2025-09-05' },
  { ackNumber: 'R 24-25/612478', dispatchDate: '2025-09-03', vehicleNumber: 'AP28TD3698', netRiceQty: 286.19856, frkQty: 2.86098, gateInDate: '2025-09-04', dumpingDate: '2025-09-06' },
  { ackNumber: 'R 24-25/613612', dispatchDate: '2025-09-04', vehicleNumber: 'AP39U1258', netRiceQty: 285.97812, frkQty: 2.86098, gateInDate: '2025-09-05', dumpingDate: '2025-09-08' },
  { ackNumber: 'R 24-25/614789', dispatchDate: '2025-09-05', vehicleNumber: 'TN10BV2587', netRiceQty: 286.23956, frkQty: 2.86124, gateInDate: '2025-09-06', dumpingDate: '2025-09-09' },
  { ackNumber: 'R 24-25/615914', dispatchDate: '2025-09-06', vehicleNumber: 'AP28TE4589', netRiceQty: 286.11834, frkQty: 2.86088, gateInDate: '2025-09-08', dumpingDate: '2025-09-10' },
  { ackNumber: 'R 24-25/617087', dispatchDate: '2025-09-08', vehicleNumber: 'AP29TC6547', netRiceQty: 286.04923, frkQty: 2.86049, gateInDate: '2025-09-09', dumpingDate: '2025-09-11' },
  { ackNumber: 'R 24-25/618214', dispatchDate: '2025-09-09', vehicleNumber: 'AP28TB7412', netRiceQty: 286.18912, frkQty: 2.86109, gateInDate: '2025-09-10', dumpingDate: '2025-09-12' },
  { ackNumber: 'R 24-25/619389', dispatchDate: '2025-09-10', vehicleNumber: 'AP39T8574', netRiceQty: 285.96767, frkQty: 2.86033, gateInDate: '2025-09-11', dumpingDate: '2025-09-13' },
  { ackNumber: 'R 24-25/620523', dispatchDate: '2025-09-11', vehicleNumber: 'TN04C5874', netRiceQty: 286.21890, frkQty: 2.86122, gateInDate: '2025-09-12', dumpingDate: '2025-09-15' },
  { ackNumber: 'R 24-25/621687', dispatchDate: '2025-09-12', vehicleNumber: 'AP28TE1258', netRiceQty: 286.14856, frkQty: 2.86051, gateInDate: '2025-09-13', dumpingDate: '2025-09-16' },
  { ackNumber: 'R 24-25/622814', dispatchDate: '2025-09-13', vehicleNumber: 'AP29TB2587', netRiceQty: 286.08890, frkQty: 2.86109, gateInDate: '2025-09-15', dumpingDate: '2025-09-17' },
  { ackNumber: 'R 24-25/623978', dispatchDate: '2025-09-15', vehicleNumber: 'AP28TD4589', netRiceQty: 286.19867, frkQty: 2.86098, gateInDate: '2025-09-16', dumpingDate: '2025-09-18' },
  { ackNumber: 'R 24-25/625123', dispatchDate: '2025-09-16', vehicleNumber: 'AP39U6547', netRiceQty: 285.97801, frkQty: 2.86098, gateInDate: '2025-09-17', dumpingDate: '2025-09-19' },
  { ackNumber: 'R 24-25/626289', dispatchDate: '2025-09-17', vehicleNumber: 'TN09W9658', netRiceQty: 286.23967, frkQty: 2.86124, gateInDate: '2025-09-18', dumpingDate: '2025-09-20' },
  { ackNumber: 'R 24-25/627412', dispatchDate: '2025-09-18', vehicleNumber: 'AP28TE7412', netRiceQty: 286.11812, frkQty: 2.86088, gateInDate: '2025-09-19', dumpingDate: '2025-09-22' },
  { ackNumber: 'R 24-25/628587', dispatchDate: '2025-09-19', vehicleNumber: 'AP29TC8574', netRiceQty: 286.04934, frkQty: 2.86049, gateInDate: '2025-09-20', dumpingDate: '2025-09-23' },
  { ackNumber: 'R 24-25/629714', dispatchDate: '2025-09-20', vehicleNumber: 'AP28TB1258', netRiceQty: 286.18901, frkQty: 2.86109, gateInDate: '2025-09-22', dumpingDate: '2025-09-24' },
  { ackNumber: 'R 24-25/630893', dispatchDate: '2025-09-22', vehicleNumber: 'AP39T3698', netRiceQty: 285.96778, frkQty: 2.86033, gateInDate: '2025-09-23', dumpingDate: '2025-09-25' },
  { ackNumber: 'R 24-25/632021', dispatchDate: '2025-09-23', vehicleNumber: 'TN03AV1258', netRiceQty: 286.21879, frkQty: 2.86122, gateInDate: '2025-09-24', dumpingDate: '2025-09-26' },
];
```

**Import Logic:**
- Each ACK should create:
  1. **CMR Delivery record**: 290 Qtls CMR, paddy consumed calculated as (netRiceQty + frkQty) / 0.67
  2. **Production record**: Fortified rice = 290 Qtls, Raw rice = netRiceQty, FRK = frkQty
  3. **Lorry Freight record**: 290 Qtls × ₹40/qtl = ₹11,600 total freight, pending payment
- Show progress bar with percentage
- Display summary after import
- Refresh all related tabs to show the imported data

---

## ⚙️ SERVICE ARCHITECTURE

Create TypeScript services for each domain:
- **BaseService**: Abstract class with common CRUD operations
- **ACKProductionService**: Manage ACK production records
- **CMRDeliveryService**: Manage CMR deliveries
- **CMRPaddyReceiptService**: Manage paddy receipts
- **CMRSeasonService**: Manage season summaries
- **ElectricityService**: Manage power readings
- **ProductionReportService**: Aggregate production data
- **ByProductSalesService**: Manage by-product sales
- **ByProductRateService**: Manage by-product pricing
- **ByProductCustomerService**: Manage customer data
- **ByProductInvoiceService**: Invoice generation
- **ByProductPaymentService**: Payment tracking
- **FRKBatchService**: FRK inventory management
- **InventoryService**: Stock items and transactions
- **LorryFreightService**: Freight management
- **TransporterService**: Transporter master data
- **SupervisorWagesService**: Wages management
- **HamaliWorkService**: Hamali work tracking
- **UserSettingsService**: User preferences
- **SyncEngine**: Real-time sync service

---

## 🔄 REAL-TIME DATA SYNC

Implement real-time updates using Supabase Realtime:
- Subscribe to database changes
- Auto-refresh data when changes occur
- Show sync status indicator
- Handle offline mode gracefully
- Optimistic UI updates

---

## 📤 EXPORT FUNCTIONALITY

**Excel Export:**
- Export any table data to Excel (.xlsx)
- Multiple sheets for related data
- Formatted headers and totals
- Use `xlsx` library

**PDF Export:**
- Generate PDF reports
- Formatted tables with calculations
- Company header/footer
- Page numbers
- Use `jspdf` and `jspdf-autotable`

**Scenario Import/Export:**
- Save calculator scenarios as JSON
- Import previously saved scenarios
- Share scenarios across users

---

## 🎯 USER EXPERIENCE FEATURES

1. **Tab Navigation**: Smooth tab switching with active state indicators
2. **Loading States**: Spinners and skeletons during data fetches
3. **Empty States**: Helpful messages when no data exists with call-to-action buttons
4. **Error Handling**: User-friendly error messages with retry options
5. **Confirmation Dialogs**: Confirm before delete operations
6. **Form Validation**: Client-side validation with helpful error messages
7. **Search & Filter**: Quick search and advanced filters on all tables
8. **Sorting**: Click column headers to sort
9. **Pagination**: For large datasets
10. **Responsive Tables**: Horizontal scroll on mobile with sticky headers
11. **Toast Notifications**: Success/error notifications for operations
12. **Keyboard Shortcuts**: Power user features
13. **Auto-save**: Save form data automatically
14. **Undo/Redo**: For critical operations

---

## 📱 RESPONSIVE DESIGN

- **Mobile**: Single column layout, hamburger menu, touch-friendly buttons
- **Tablet**: Two-column layouts where appropriate
- **Desktop**: Full multi-column layouts with sidebars
- **Large Desktop**: Utilize extra space with dashboard widgets

---

## 🔧 TECHNICAL STACK

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- react-hook-form (forms) or native form handling
- date-fns or dayjs (date manipulation)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Realtime (live updates)
- Row Level Security (RLS)

**Libraries:**
- xlsx: Excel export
- jspdf & jspdf-autotable: PDF generation
- @supabase/supabase-js: Supabase client

---

## 🎨 COMPONENT STRUCTURE

- **Layout**: Main app shell with sidebar/tabs
- **AuthPage**: Login/signup UI
- **CMRPaddyDashboard**: Season tracking, receipts, deliveries
- **CMRSeasonDetails**: Detailed season statistics
- **CMRDataImport**: 99 ACK import feature
- **ProductionTracker**: ACK production management
- **LorryFreightManager**: Freight management
- **WagesManager**: Employee wages
- **HamaliWorkManager**: Labor work tracking
- **InventoryManager**: Stock and FRK management
- **ByProductSalesManager**: By-product sales, invoices, payments
- **PricingList**: Rate management
- **PowerFactorTracker**: Electricity monitoring
- **ACKCalculator**: Single ACK profitability calculator
- **InputForm** (Milling Calculator): General milling scenario calculator
- **PurchaseAnalysis**: Paddy purchase analysis
- **YieldControl**: Yield structure configuration
- **FinancialSummary**: Overall financial dashboard
- **Modal Components**: Reusable modals for forms
- **Table Components**: Reusable data tables

---

## 🚀 IMPLEMENTATION STEPS

1. **Setup Project**: Vite + React + TypeScript + Tailwind
2. **Setup Supabase**: Initialize Supabase client, environment variables
3. **Create Database Schema**: Run all migrations with RLS policies
4. **Build Auth System**: Login, signup, password reset, auth context
5. **Create Services Layer**: All service classes with CRUD operations
6. **Build Layout**: Main app shell, tab navigation
7. **Implement Each Tab**: One by one with full functionality
8. **Add Import Feature**: 99 ACK bulk import with progress tracking
9. **Implement Export**: Excel and PDF generation
10. **Add Real-time Sync**: Supabase subscriptions
11. **Polish UI**: Animations, loading states, error handling
12. **Test All Features**: End-to-end testing
13. **Deploy**: Production deployment

---

## ✨ FINAL POLISH

- Smooth animations and transitions
- Haptic feedback (subtle) on interactions
- Micro-interactions (button presses, hover effects)
- Loading skeletons instead of spinners where appropriate
- Progressive disclosure (don't overwhelm with options)
- Contextual help tooltips
- Keyboard navigation support
- Accessibility (ARIA labels, semantic HTML)
- Performance optimization (lazy loading, code splitting)
- SEO if applicable

---

## 📝 IMPORTANT NOTES

- **Data Integrity**: NEVER lose user data. Implement proper error handling and recovery.
- **Security**: All data must be protected with RLS. No public access.
- **Season Tracking**: Everything is tied to a season (e.g., "Rabi 24-25", "Kharif 24-25")
- **ACK Standard**: 1 ACK = 290 Quintals of fortified rice (typical)
- **Fortified Rice**: Made from raw rice + FRK (approximately 99% raw rice + 1% FRK)
- **CMR Rice**: Custom Milled Rice for government programs (FCI)
- **By-products**: Broken Rice, Bran, Param, Rejection Rice, Husk (all have market value)
- **Financial Accuracy**: All calculations must be precise for accounting
- **Real-world Usage**: This is for actual rice mill operations, not a demo

---

This is a complete, production-ready system. Build it with attention to detail, beautiful UI, and robust functionality. Every feature should work flawlessly. The user interface should be intuitive, fast, and delightful to use.
