import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, IndianRupee, Users, FileText, CreditCard, Save, X } from 'lucide-react';
import { ByProductRateService } from '../services/ByProductRateService';
import { ByProductCustomerService } from '../services/ByProductCustomerService';
import { ByProductInvoiceService } from '../services/ByProductInvoiceService';
import { ByProductPaymentService } from '../services/ByProductPaymentService';
import type {
  ByProductRate,
  ByProductCustomer,
  InvoiceWithDetails,
  ByProductType,
  InvoiceType,
  PaymentMethod,
  ByProductInvoiceItem
} from '../types';

type TabType = 'rates' | 'customers' | 'invoices' | 'payments';

const BY_PRODUCT_LABELS: Record<ByProductType, string> = {
  broken_rice: 'Broken Rice',
  bran: 'Bran',
  param: 'Param',
  rejection_rice: 'Rejection Rice',
  husk: 'Husk'
};

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  other: 'Other'
};

export default function ByProductSalesManager() {
  const [activeTab, setActiveTab] = useState<TabType>('rates');
  const [loading, setLoading] = useState(true);

  const [rates, setRates] = useState<ByProductRate[]>([]);
  const [customers, setCustomers] = useState<ByProductCustomer[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);

  const [showRateForm, setShowRateForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);

  const [rateForm, setRateForm] = useState({
    byproduct_type: 'broken_rice' as ByProductType,
    rate: '',
    effective_from: new Date().toISOString().split('T')[0],
    notes: '',
    is_active: true
  });

  const [customerForm, setCustomerForm] = useState({
    id: '',
    name: '',
    gstin: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    invoice_type: 'bill_of_supply' as InvoiceType,
    invoice_date: new Date().toISOString().split('T')[0],
    customer_id: null as string | null,
    customer_name: '',
    customer_gstin: '',
    customer_address: '',
    cgst_rate: 0,
    sgst_rate: 0,
    igst_rate: 0,
    notes: '',
    status: 'draft' as const,
    items: [] as Omit<ByProductInvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]
  });

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'cash' as PaymentMethod,
    reference_number: '',
    notes: ''
  });

  const rateService = new ByProductRateService();
  const customerService = new ByProductCustomerService();
  const invoiceService = new ByProductInvoiceService();
  const paymentService = new ByProductPaymentService();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'rates') {
        const data = await rateService.getAll();
        setRates(data);
      } else if (activeTab === 'customers') {
        const data = await customerService.getAll();
        setCustomers(data);
      } else if (activeTab === 'invoices' || activeTab === 'payments') {
        const data = await invoiceService.getAllWithDetails();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rateService.create({
        byproduct_type: rateForm.byproduct_type,
        rate: parseFloat(rateForm.rate),
        effective_from: rateForm.effective_from,
        notes: rateForm.notes,
        is_active: rateForm.is_active
      });
      setRateForm({
        byproduct_type: 'broken_rice',
        rate: '',
        effective_from: new Date().toISOString().split('T')[0],
        notes: '',
        is_active: true
      });
      setShowRateForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving rate:', error);
      alert('Failed to save rate');
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (customerForm.id) {
        await customerService.update(customerForm.id, {
          name: customerForm.name,
          gstin: customerForm.gstin,
          address: customerForm.address,
          phone: customerForm.phone,
          email: customerForm.email,
          notes: customerForm.notes
        });
      } else {
        await customerService.create({
          name: customerForm.name,
          gstin: customerForm.gstin,
          address: customerForm.address,
          phone: customerForm.phone,
          email: customerForm.email,
          notes: customerForm.notes
        });
      }
      setCustomerForm({ id: '', name: '', gstin: '', address: '', phone: '', email: '', notes: '' });
      setShowCustomerForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (invoiceForm.items.length === 0) {
        alert('Please add at least one item to the invoice');
        return;
      }

      const nextInvoiceNumber = await invoiceService.getNextInvoiceNumber('INV');

      const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.amount, 0);
      const cgst_amount = (subtotal * invoiceForm.cgst_rate) / 100;
      const sgst_amount = (subtotal * invoiceForm.sgst_rate) / 100;
      const igst_amount = (subtotal * invoiceForm.igst_rate) / 100;
      const total_amount = subtotal + cgst_amount + sgst_amount + igst_amount;

      await invoiceService.create({
        invoice_number: nextInvoiceNumber,
        invoice_type: invoiceForm.invoice_type,
        invoice_date: invoiceForm.invoice_date,
        customer_id: invoiceForm.customer_id,
        customer_name: invoiceForm.customer_name,
        customer_gstin: invoiceForm.customer_gstin,
        customer_address: invoiceForm.customer_address,
        subtotal,
        cgst_rate: invoiceForm.cgst_rate,
        sgst_rate: invoiceForm.sgst_rate,
        igst_rate: invoiceForm.igst_rate,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total_amount,
        notes: invoiceForm.notes,
        status: 'issued'
      }, invoiceForm.items);

      setInvoiceForm({
        invoice_number: '',
        invoice_type: 'bill_of_supply',
        invoice_date: new Date().toISOString().split('T')[0],
        customer_id: null,
        customer_name: '',
        customer_gstin: '',
        customer_address: '',
        cgst_rate: 0,
        sgst_rate: 0,
        igst_rate: 0,
        notes: '',
        status: 'draft',
        items: []
      });
      setShowInvoiceForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.create({
        invoice_id: paymentForm.invoice_id,
        payment_date: paymentForm.payment_date,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.reference_number,
        notes: paymentForm.notes
      });

      const invoice = invoices.find(inv => inv.id === paymentForm.invoice_id);
      if (invoice) {
        const totalPaid = await paymentService.getTotalPaid(invoice.id);
        if (totalPaid >= invoice.total_amount) {
          await invoiceService.updateStatus(invoice.id, 'paid');
        }
      }

      setPaymentForm({
        invoice_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: ''
      });
      setShowPaymentForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Failed to save payment');
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [
        ...invoiceForm.items,
        {
          byproduct_type: 'broken_rice',
          description: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          from_ack_number: '',
          to_ack_number: ''
        }
      ]
    });
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }

    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const removeInvoiceItem = (index: number) => {
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm('Delete this rate?')) return;
    try {
      await rateService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting rate:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await customerService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleEditCustomer = (customer: ByProductCustomer) => {
    setCustomerForm({
      id: customer.id,
      name: customer.name,
      gstin: customer.gstin,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes
    });
    setShowCustomerForm(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">By-Product Sales Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage rates, customers, invoices, and payments
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'rates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <IndianRupee className="w-5 h-5" />
          Rates
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          Customers
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Payments
        </button>
      </div>

      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRateForm(!showRateForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {showRateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showRateForm ? 'Cancel' : 'Add Rate'}
            </button>
          </div>

          {showRateForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Rate</h3>
              <form onSubmit={handleRateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">By-Product Type *</label>
                    <select
                      value={rateForm.byproduct_type}
                      onChange={(e) => setRateForm({ ...rateForm, byproduct_type: e.target.value as ByProductType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(BY_PRODUCT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹/Qtl) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={rateForm.rate}
                      onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                    <input
                      type="date"
                      value={rateForm.effective_from}
                      onChange={(e) => setRateForm({ ...rateForm, effective_from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={rateForm.notes}
                    onChange={(e) => setRateForm({ ...rateForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={rateForm.is_active}
                    onChange={(e) => setRateForm({ ...rateForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Set as active rate (deactivates other rates for this product)
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Rate
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(BY_PRODUCT_LABELS).map(([type, label]) => {
              const typeRates = rates.filter(r => r.byproduct_type === type).sort((a, b) =>
                new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
              );
              const activeRate = typeRates.find(r => r.is_active);

              return (
                <div key={type} className="bg-white rounded-lg shadow-md p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{label}</h3>
                  {activeRate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="text-sm text-green-600 font-medium mb-1">Current Rate</div>
                      <div className="text-2xl font-bold text-green-700">{formatCurrency(activeRate.rate)}/Qtl</div>
                      <div className="text-xs text-green-600 mt-1">Since {formatDate(activeRate.effective_from)}</div>
                    </div>
                  )}
                  {typeRates.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Rate History</div>
                      {typeRates.slice(0, 3).map(rate => (
                        <div key={rate.id} className={`flex items-center justify-between text-xs p-2 rounded ${rate.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div>
                            <div className="font-medium">{formatCurrency(rate.rate)}/Qtl</div>
                            <div className="text-gray-500">{formatDate(rate.effective_from)}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setCustomerForm({ id: '', name: '', gstin: '', address: '', phone: '', email: '', notes: '' });
                setShowCustomerForm(!showCustomerForm);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {showCustomerForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCustomerForm ? 'Cancel' : 'Add Customer'}
            </button>
          </div>

          {showCustomerForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {customerForm.id ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={customerForm.gstin}
                      onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(customer => (
              <div key={customer.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                    {customer.gstin && (
                      <p className="text-sm text-gray-600">GSTIN: {customer.gstin}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {customer.phone && (
                  <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
                )}
                {customer.email && (
                  <p className="text-sm text-gray-600">Email: {customer.email}</p>
                )}
                {customer.address && (
                  <p className="text-sm text-gray-600 mt-2">{customer.address}</p>
                )}
              </div>
            ))}
          </div>

          {customers.length === 0 && !showCustomerForm && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Customers Yet</h3>
              <p className="text-gray-600">Add customers to create invoices</p>
            </div>
          )}
        </div>
      )}

{activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowInvoiceForm(!showInvoiceForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {showInvoiceForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showInvoiceForm ? 'Cancel' : 'Create Invoice'}
            </button>
          </div>

          {showInvoiceForm && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Create New Invoice</h3>
              <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type *</label>
                    <select
                      value={invoiceForm.invoice_type}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_type: e.target.value as InvoiceType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bill_of_supply">Bill of Supply</option>
                      <option value="tax_invoice">Tax Invoice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceForm.invoice_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                      value={invoiceForm.customer_id || ''}
                      onChange={(e) => {
                        const customerId = e.target.value || null;
                        const customer = customers.find(c => c.id === customerId);
                        setInvoiceForm({
                          ...invoiceForm,
                          customer_id: customerId,
                          customer_name: customer?.name || '',
                          customer_gstin: customer?.gstin || '',
                          customer_address: customer?.address || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select or enter manually</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={invoiceForm.customer_name}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer GSTIN</label>
                    <input
                      type="text"
                      value={invoiceForm.customer_gstin}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customer_gstin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
                    <input
                      type="text"
                      value={invoiceForm.customer_address}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customer_address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Invoice Items</h4>
                    <button
                      type="button"
                      onClick={addInvoiceItem}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {invoiceForm.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                            <select
                              value={item.byproduct_type}
                              onChange={(e) => updateInvoiceItem(index, 'byproduct_type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              {Object.entries(BY_PRODUCT_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Rate</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                            <input
                              type="number"
                              value={item.amount}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">From ACK</label>
                            <input
                              type="text"
                              value={item.from_ack_number}
                              onChange={(e) => updateInvoiceItem(index, 'from_ack_number', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">To ACK</label>
                              <input
                                type="text"
                                value={item.to_ack_number}
                                onChange={(e) => updateInvoiceItem(index, 'to_ack_number', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeInvoiceItem(index)}
                              className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {invoiceForm.invoice_type === 'tax_invoice' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CGST %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceForm.cgst_rate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, cgst_rate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SGST %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceForm.sgst_rate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, sgst_rate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IGST %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceForm.igst_rate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, igst_rate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(invoiceForm.items.reduce((sum, item) => sum + item.amount, 0))}</span>
                  </div>
                  {invoiceForm.invoice_type === 'tax_invoice' && (
                    <>
                      {invoiceForm.cgst_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>CGST ({invoiceForm.cgst_rate}%):</span>
                          <span className="font-semibold">{formatCurrency((invoiceForm.items.reduce((sum, item) => sum + item.amount, 0) * invoiceForm.cgst_rate) / 100)}</span>
                        </div>
                      )}
                      {invoiceForm.sgst_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>SGST ({invoiceForm.sgst_rate}%):</span>
                          <span className="font-semibold">{formatCurrency((invoiceForm.items.reduce((sum, item) => sum + item.amount, 0) * invoiceForm.sgst_rate) / 100)}</span>
                        </div>
                      )}
                      {invoiceForm.igst_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>IGST ({invoiceForm.igst_rate}%):</span>
                          <span className="font-semibold">{formatCurrency((invoiceForm.items.reduce((sum, item) => sum + item.amount, 0) * invoiceForm.igst_rate) / 100)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-blue-300">
                    <span>Total:</span>
                    <span>{formatCurrency(invoiceForm.items.reduce((sum, item) => sum + item.amount, 0) * (1 + (invoiceForm.cgst_rate + invoiceForm.sgst_rate + invoiceForm.igst_rate) / 100))}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {invoices.map(invoice => (
              <div key={invoice.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800">{invoice.invoice_number}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                        invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {invoice.invoice_type === 'tax_invoice' ? 'Tax Invoice' : 'Bill of Supply'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{invoice.customer_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.invoice_date)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(invoice.total_amount)}</div>
                    {invoice.balance > 0 && (
                      <div className="text-sm text-red-600">Balance: {formatCurrency(invoice.balance)}</div>
                    )}
                    {invoice.balance === 0 && invoice.total_amount > 0 && (
                      <div className="text-sm text-green-600">Fully Paid</div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                  <div className="space-y-1">
                    {invoice.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {BY_PRODUCT_LABELS[item.byproduct_type]} - {formatNumber(item.quantity)} Qtls @ {formatCurrency(item.rate)}/Qtl
                          {item.from_ack_number && ` (${item.from_ack_number} - ${item.to_ack_number})`}
                        </span>
                        <span className="font-semibold text-gray-800">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {invoice.balance > 0 && invoice.status !== 'cancelled' && (
                  <div className="border-t pt-3 mt-3">
                    <button
                      onClick={() => {
                        setPaymentForm({
                          invoice_id: invoice.id,
                          payment_date: new Date().toISOString().split('T')[0],
                          amount: invoice.balance.toString(),
                          payment_method: 'cash',
                          reference_number: '',
                          notes: ''
                        });
                        setSelectedInvoice(invoice);
                        setShowPaymentForm(true);
                        setActiveTab('payments');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Record Payment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {invoices.length === 0 && !showInvoiceForm && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600">Create your first invoice</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          {showPaymentForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Payment</h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label>
                    <select
                      value={paymentForm.invoice_id}
                      onChange={(e) => {
                        const invoice = invoices.find(inv => inv.id === e.target.value);
                        setPaymentForm({
                          ...paymentForm,
                          invoice_id: e.target.value,
                          amount: invoice?.balance.toString() || ''
                        });
                        setSelectedInvoice(invoice || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Invoice</option>
                      {invoices.filter(inv => inv.balance > 0).map(invoice => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.customer_name} (Balance: {formatCurrency(invoice.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      value={paymentForm.payment_method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as PaymentMethod })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    >
                      {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <input
                      type="text"
                      value={paymentForm.reference_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Cheque no., Transaction ID, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedInvoice(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
            {invoices
              .filter(inv => inv.payments.length > 0)
              .map(invoice => (
                <div key={invoice.id} className="bg-white rounded-lg shadow-md p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">{invoice.invoice_number}</h4>
                      <p className="text-sm text-gray-600">{invoice.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Invoice: {formatCurrency(invoice.total_amount)}</div>
                      <div className="text-sm font-semibold text-green-600">
                        Paid: {formatCurrency(invoice.total_amount - invoice.balance)}
                      </div>
                      {invoice.balance > 0 && (
                        <div className="text-sm font-semibold text-red-600">
                          Balance: {formatCurrency(invoice.balance)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    {invoice.payments.map(payment => (
                      <div key={payment.id} className="flex justify-between items-center text-sm bg-green-50 p-2 rounded">
                        <div>
                          <span className="font-medium">{formatDate(payment.payment_date)}</span>
                          <span className="text-gray-600 ml-2">via {PAYMENT_METHODS[payment.payment_method]}</span>
                          {payment.reference_number && (
                            <span className="text-gray-500 ml-2">({payment.reference_number})</span>
                          )}
                        </div>
                        <span className="font-bold text-green-700">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {invoices.filter(inv => inv.payments.length > 0).length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Yet</h3>
              <p className="text-gray-600">Record payments against invoices</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
