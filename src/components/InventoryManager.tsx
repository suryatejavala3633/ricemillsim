import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Plus, Save, X, FileText, Truck, Target, Calendar } from 'lucide-react';
import { InventoryService, StockTransactionService } from '../services/InventoryService';
import { FRKBatchService } from '../services/FRKBatchService';
import { CMRPaddyReceiptService, CMRRiceTargetService } from '../services/CMRService';
import CMRSeasonDetails from './CMRSeasonDetails';
import type { StockItem, FRKBatch, CMRPaddyReceipt, StockTransaction } from '../types';

type TabType = 'overview' | 'frk' | 'receipts' | 'transactions' | 'target' | 'season';

const CURRENT_YEAR = '2024-25';

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [frkBatches, setFrkBatches] = useState<FRKBatch[]>([]);
  const [paddyReceipts, setPaddyReceipts] = useState<CMRPaddyReceipt[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [riceTarget, setRiceTarget] = useState<any>(null);

  const [showFrkForm, setShowFrkForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTargetForm, setShowTargetForm] = useState(false);

  const [frkForm, setFrkForm] = useState({
    batch_number: '',
    received_date: new Date().toISOString().split('T')[0],
    quantity_qtls: '',
    kernel_test_certificate_number: '',
    kernel_test_date: '',
    kernel_test_expiry: '',
    premix_test_certificate_number: '',
    premix_test_date: '',
    premix_test_expiry: '',
    supplier_name: '',
    notes: ''
  });

  const [receiptForm, setReceiptForm] = useState({
    receipt_date: new Date().toISOString().split('T')[0],
    paddy_quantity_qtls: '',
    paddy_bags: '',
    gunnies_received: '',
    vehicle_number: '',
    supplier: '',
    notes: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    item_type: 'gunnies' as const,
    transaction_type: 'in' as const,
    transaction_date: new Date().toISOString().split('T')[0],
    quantity: '',
    notes: ''
  });

  const [targetForm, setTargetForm] = useState({
    initial_target_qtls: ''
  });

  const inventoryService = new InventoryService();
  const transactionService = new StockTransactionService();
  const frkService = new FRKBatchService();
  const paddyReceiptService = new CMRPaddyReceiptService();
  const targetService = new CMRRiceTargetService();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      await inventoryService.initializeStockItems(CURRENT_YEAR);

      if (activeTab === 'overview') {
        const items = await inventoryService.getAll();
        setStockItems(items);
      } else if (activeTab === 'frk') {
        const batches = await frkService.getAll();
        setFrkBatches(batches);
      } else if (activeTab === 'receipts') {
        const receipts = await paddyReceiptService.getAll();
        setPaddyReceipts(receipts);
      } else if (activeTab === 'transactions') {
        const trans = await transactionService.getAll();
        setTransactions(trans.slice(0, 50));
      } else if (activeTab === 'target') {
        const target = await targetService.getOrCreateTarget(CURRENT_YEAR);
        const progress = await targetService.getProgress(CURRENT_YEAR);
        setRiceTarget({ ...target, progress });
      }

      const items = await inventoryService.getAll();
      setStockItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFrkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await frkService.create({
        batch_number: frkForm.batch_number,
        received_date: frkForm.received_date,
        quantity_qtls: parseFloat(frkForm.quantity_qtls),
        current_stock_qtls: parseFloat(frkForm.quantity_qtls),
        kernel_test_certificate_number: frkForm.kernel_test_certificate_number,
        kernel_test_date: frkForm.kernel_test_date || null,
        kernel_test_expiry: frkForm.kernel_test_expiry || null,
        premix_test_certificate_number: frkForm.premix_test_certificate_number,
        premix_test_date: frkForm.premix_test_date || null,
        premix_test_expiry: frkForm.premix_test_expiry || null,
        supplier_name: frkForm.supplier_name,
        notes: frkForm.notes,
        status: 'active'
      });

      await transactionService.recordTransaction({
        item_type: 'frk',
        transaction_type: 'in',
        transaction_date: frkForm.received_date,
        quantity: parseFloat(frkForm.quantity_qtls),
        frk_batch_id: null,
        reference_type: 'purchase',
        reference_id: frkForm.batch_number,
        from_location: frkForm.supplier_name,
        notes: `FRK Batch ${frkForm.batch_number} received`
      }, CURRENT_YEAR);

      setFrkForm({
        batch_number: '',
        received_date: new Date().toISOString().split('T')[0],
        quantity_qtls: '',
        kernel_test_certificate_number: '',
        kernel_test_date: '',
        kernel_test_expiry: '',
        premix_test_certificate_number: '',
        premix_test_date: '',
        premix_test_expiry: '',
        supplier_name: '',
        notes: ''
      });
      setShowFrkForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving FRK batch:', error);
      alert('Failed to save FRK batch');
    }
  };

  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paddyReceiptService.create({
        receipt_date: receiptForm.receipt_date,
        paddy_quantity_qtls: parseFloat(receiptForm.paddy_quantity_qtls),
        paddy_bags: parseFloat(receiptForm.paddy_bags),
        gunnies_received: parseFloat(receiptForm.gunnies_received),
        vehicle_number: receiptForm.vehicle_number,
        supplier: receiptForm.supplier,
        notes: receiptForm.notes
      }, CURRENT_YEAR);

      setReceiptForm({
        receipt_date: new Date().toISOString().split('T')[0],
        paddy_quantity_qtls: '',
        paddy_bags: '',
        gunnies_received: '',
        vehicle_number: '',
        supplier: '',
        notes: ''
      });
      setShowReceiptForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Failed to save receipt');
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionService.recordTransaction({
        item_type: transactionForm.item_type,
        transaction_type: transactionForm.transaction_type,
        transaction_date: transactionForm.transaction_date,
        quantity: parseFloat(transactionForm.quantity),
        frk_batch_id: null,
        reference_type: 'manual',
        reference_id: '',
        from_location: '',
        notes: transactionForm.notes
      }, CURRENT_YEAR);

      setTransactionForm({
        item_type: 'gunnies',
        transaction_type: 'in',
        transaction_date: new Date().toISOString().split('T')[0],
        quantity: '',
        notes: ''
      });
      setShowTransactionForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await targetService.setInitialTarget(CURRENT_YEAR, parseFloat(targetForm.initial_target_qtls));
      setTargetForm({ initial_target_qtls: '' });
      setShowTargetForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving target:', error);
      alert('Failed to save target');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const getStockStatus = (current: number, reorder: number) => {
    if (current <= 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' };
    if (current <= reorder) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Low Stock' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'In Stock' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track FRK, Gunnies, Stickers, and CMR deliveries
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-5 h-5" />
          Stock Overview
        </button>
        <button
          onClick={() => setActiveTab('frk')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'frk'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          FRK Batches
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'receipts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Truck className="w-5 h-5" />
          Paddy Receipts
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('target')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'target'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-5 h-5" />
          CMR Target
        </button>
        <button
          onClick={() => setActiveTab('season')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'season'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-5 h-5" />
          CMR Season
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stockItems.map(item => {
              const status = getStockStatus(item.current_stock, item.reorder_level);
              return (
                <div key={item.id} className={`rounded-lg shadow-md p-6 ${status.bg} border-2 border-gray-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{item.item_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} font-semibold`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <span className={`text-3xl font-bold ${status.color}`}>
                        {formatNumber(item.current_stock, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium text-gray-800">{item.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reorder Level:</span>
                      <span className="font-medium text-gray-800">{formatNumber(item.reorder_level, 0)}</span>
                    </div>
                    {item.current_stock <= item.reorder_level && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="flex items-center gap-2 text-orange-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-semibold">Reorder Required</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-4">Per ACK Consumption</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-600 font-medium">CMR Rice</div>
                <div className="text-2xl font-bold text-blue-900">287.1 Qtls</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">FRK</div>
                <div className="text-2xl font-bold text-blue-900">2.9 Qtls</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Gunnies</div>
                <div className="text-2xl font-bold text-blue-900">580 Pcs</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Stickers</div>
                <div className="text-2xl font-bold text-blue-900">580 Pcs</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowTransactionForm(!showTransactionForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {showTransactionForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showTransactionForm ? 'Cancel' : 'Add Stock Transaction'}
            </button>
          </div>

          {showTransactionForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Stock Transaction</h3>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
                    <select
                      value={transactionForm.item_type}
                      onChange={(e) => setTransactionForm({ ...transactionForm, item_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="gunnies">Gunnies</option>
                      <option value="stickers">Stickers</option>
                      <option value="frk">FRK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={transactionForm.transaction_type}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transaction_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={transactionForm.transaction_date}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionForm.quantity}
                      onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={transactionForm.notes}
                    onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Transaction
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'frk' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowFrkForm(!showFrkForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {showFrkForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showFrkForm ? 'Cancel' : 'Add FRK Batch'}
            </button>
          </div>

          {showFrkForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New FRK Batch</h3>
              <form onSubmit={handleFrkSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                    <input
                      type="text"
                      value={frkForm.batch_number}
                      onChange={(e) => setFrkForm({ ...frkForm, batch_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received Date *</label>
                    <input
                      type="date"
                      value={frkForm.received_date}
                      onChange={(e) => setFrkForm({ ...frkForm, received_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Qtls) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={frkForm.quantity_qtls}
                      onChange={(e) => setFrkForm({ ...frkForm, quantity_qtls: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={frkForm.supplier_name}
                      onChange={(e) => setFrkForm({ ...frkForm, supplier_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Kernel Test Certificate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                      <input
                        type="text"
                        value={frkForm.kernel_test_certificate_number}
                        onChange={(e) => setFrkForm({ ...frkForm, kernel_test_certificate_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                      <input
                        type="date"
                        value={frkForm.kernel_test_date}
                        onChange={(e) => setFrkForm({ ...frkForm, kernel_test_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={frkForm.kernel_test_expiry}
                        onChange={(e) => setFrkForm({ ...frkForm, kernel_test_expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Premix Test Certificate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                      <input
                        type="text"
                        value={frkForm.premix_test_certificate_number}
                        onChange={(e) => setFrkForm({ ...frkForm, premix_test_certificate_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                      <input
                        type="date"
                        value={frkForm.premix_test_date}
                        onChange={(e) => setFrkForm({ ...frkForm, premix_test_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={frkForm.premix_test_expiry}
                        onChange={(e) => setFrkForm({ ...frkForm, premix_test_expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={frkForm.notes}
                    onChange={(e) => setFrkForm({ ...frkForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFrkForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Batch
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {frkBatches.map(batch => (
              <div key={batch.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800">Batch {batch.batch_number}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        batch.status === 'active' ? 'bg-green-100 text-green-700' :
                        batch.status === 'depleted' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {batch.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Received: {formatDate(batch.received_date)}</p>
                    {batch.supplier_name && (
                      <p className="text-sm text-gray-600">Supplier: {batch.supplier_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(batch.current_stock_qtls)} Qtls</div>
                    <div className="text-sm text-gray-500">of {formatNumber(batch.quantity_qtls)} Qtls</div>
                  </div>
                </div>

                {(batch.kernel_test_certificate_number || batch.premix_test_certificate_number) && (
                  <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {batch.kernel_test_certificate_number && (
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-semibold text-blue-900 mb-1">Kernel Test Certificate</div>
                        <div className="text-blue-700">Cert: {batch.kernel_test_certificate_number}</div>
                        {batch.kernel_test_expiry && (
                          <div className="text-blue-600">Expires: {formatDate(batch.kernel_test_expiry)}</div>
                        )}
                      </div>
                    )}
                    {batch.premix_test_certificate_number && (
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-semibold text-green-900 mb-1">Premix Test Certificate</div>
                        <div className="text-green-700">Cert: {batch.premix_test_certificate_number}</div>
                        {batch.premix_test_expiry && (
                          <div className="text-green-600">Expires: {formatDate(batch.premix_test_expiry)}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {frkBatches.length === 0 && !showFrkForm && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No FRK Batches Yet</h3>
              <p className="text-gray-600">Add FRK batches with test certificates</p>
            </div>
          )}
        </div>
      )}

{activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowReceiptForm(!showReceiptForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {showReceiptForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showReceiptForm ? 'Cancel' : 'Add Paddy Receipt'}
            </button>
          </div>

          {showReceiptForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Paddy Receipt</h3>
              <form onSubmit={handleReceiptSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date *</label>
                    <input
                      type="date"
                      value={receiptForm.receipt_date}
                      onChange={(e) => setReceiptForm({ ...receiptForm, receipt_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paddy Quantity (Qtls) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={receiptForm.paddy_quantity_qtls}
                      onChange={(e) => setReceiptForm({ ...receiptForm, paddy_quantity_qtls: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paddy Bags *</label>
                    <input
                      type="number"
                      value={receiptForm.paddy_bags}
                      onChange={(e) => setReceiptForm({ ...receiptForm, paddy_bags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gunnies Received *</label>
                    <input
                      type="number"
                      value={receiptForm.gunnies_received}
                      onChange={(e) => setReceiptForm({ ...receiptForm, gunnies_received: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={receiptForm.vehicle_number}
                      onChange={(e) => setReceiptForm({ ...receiptForm, vehicle_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={receiptForm.supplier}
                      onChange={(e) => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={receiptForm.notes}
                    onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReceiptForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Receipt
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {paddyReceipts.map(receipt => (
              <div key={receipt.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-800">{formatDate(receipt.receipt_date)}</h3>
                      {receipt.vehicle_number && (
                        <span className="text-sm text-gray-600">Vehicle: {receipt.vehicle_number}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Paddy Quantity</div>
                        <div className="font-bold text-gray-800">{formatNumber(receipt.paddy_quantity_qtls)} Qtls</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Paddy Bags</div>
                        <div className="font-bold text-gray-800">{formatNumber(receipt.paddy_bags, 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Gunnies Received</div>
                        <div className="font-bold text-green-700">{formatNumber(receipt.gunnies_received, 0)}</div>
                      </div>
                      {receipt.supplier && (
                        <div>
                          <div className="text-gray-600">Supplier</div>
                          <div className="font-medium text-gray-800">{receipt.supplier}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {paddyReceipts.length === 0 && !showReceiptForm && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Paddy Receipts Yet</h3>
              <p className="text-gray-600">Record paddy receipts with gunny bag counts</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {transactions.map(trans => (
            <div key={trans.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  trans.transaction_type === 'in' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {trans.transaction_type === 'in' ? (
                    <TrendingUp className={`w-6 h-6 text-green-600`} />
                  ) : (
                    <TrendingUp className={`w-6 h-6 text-red-600 transform rotate-180`} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 capitalize">
                      {trans.item_type.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      trans.transaction_type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trans.transaction_type === 'in' ? 'IN' : 'OUT'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{formatDate(trans.transaction_date)}</div>
                  {trans.notes && (
                    <div className="text-xs text-gray-500 mt-1">{trans.notes}</div>
                  )}
                </div>
              </div>
              <div className={`text-xl font-bold ${
                trans.transaction_type === 'in' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trans.transaction_type === 'in' ? '+' : '-'}{formatNumber(trans.quantity, trans.item_type === 'frk' ? 2 : 0)}
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Transactions Yet</h3>
              <p className="text-gray-600">Stock movements will appear here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'target' && riceTarget && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">CMR Rice Delivery Target {CURRENT_YEAR}</h3>
                <p className="text-blue-100">Track your annual CMR rice delivery progress</p>
              </div>
              <Target className="w-12 h-12 text-blue-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-blue-200 text-sm mb-1">Initial Target</div>
                <div className="text-3xl font-bold">{formatNumber(riceTarget.initial_target_qtls, 0)}</div>
                <div className="text-blue-200 text-sm">Quintals</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-blue-200 text-sm mb-1">Delivered</div>
                <div className="text-3xl font-bold text-green-300">{formatNumber(riceTarget.progress?.delivered || 0, 0)}</div>
                <div className="text-blue-200 text-sm">Quintals</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-blue-200 text-sm mb-1">Remaining</div>
                <div className="text-3xl font-bold text-yellow-300">{formatNumber(riceTarget.current_balance_qtls, 0)}</div>
                <div className="text-blue-200 text-sm">Quintals</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-blue-200 text-sm mb-1">ACKs Completed</div>
                <div className="text-3xl font-bold">{riceTarget.acks_completed}</div>
                <div className="text-blue-200 text-sm">Batches</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{formatNumber(riceTarget.progress?.percentage || 0, 1)}%</span>
              </div>
              <div className="w-full bg-blue-800 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(riceTarget.progress?.percentage || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowTargetForm(!showTargetForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {showTargetForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showTargetForm ? 'Cancel' : 'Set Target'}
            </button>
          </div>

          {showTargetForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Set CMR Rice Target</h3>
              <form onSubmit={handleTargetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Target (Quintals) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetForm.initial_target_qtls}
                    onChange={(e) => setTargetForm({ ...targetForm, initial_target_qtls: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target quantity in quintals"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will reset the current target and progress
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTargetForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Set Target
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">About ACK Production</h4>
                <p className="text-sm text-yellow-800">
                  Each ACK production automatically deducts 287.1 quintals from the CMR rice target,
                  2.9 quintals of FRK, 580 gunnies, and 580 stickers from inventory.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'season' && (
        <CMRSeasonDetails />
      )}
    </div>
  );
}
