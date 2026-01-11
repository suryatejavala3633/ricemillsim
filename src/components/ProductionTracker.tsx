import { useState, useEffect } from 'react';
import { Plus, Trash2, BarChart3, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { ACKProductionService } from '../services/ACKProductionService';
import { ByProductSalesService } from '../services/ByProductSalesService';
import type { ACKProduction, ByProductSale, ByProductType, YieldAnalysis } from '../types';

type ViewMode = 'ack' | 'sales';

const BY_PRODUCT_LABELS: Record<ByProductType, string> = {
  broken_rice: 'Broken Rice',
  bran: 'Bran',
  param: 'Param',
  rejection_rice: 'Rejection Rice',
  husk: 'Husk'
};

export default function ProductionTracker() {
  const [viewMode, setViewMode] = useState<ViewMode>('ack');
  const [ackProductions, setAckProductions] = useState<ACKProduction[]>([]);
  const [byProductSales, setByProductSales] = useState<ByProductSale[]>([]);
  const [yieldAnalysis, setYieldAnalysis] = useState<YieldAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showACKForm, setShowACKForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [ackFormData, setAckFormData] = useState({
    ack_number: '',
    production_date: new Date().toISOString().split('T')[0],
    rice_type: 'raw' as 'raw' | 'boiled',
    fortified_rice_qty: '290',
    raw_rice_qty: '287.1',
    frk_qty: '2.9',
    notes: ''
  });

  const [saleFormData, setSaleFormData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    byproduct_type: 'broken_rice' as ByProductType,
    quantity: '',
    from_ack_number: '',
    to_ack_number: '',
    ack_count: '',
    rate: '',
    notes: ''
  });

  const ackService = new ACKProductionService();
  const salesService = new ByProductSalesService();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (viewMode === 'ack') {
      suggestNextACK();
    }
  }, [viewMode, ackProductions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [acks, sales, analysis] = await Promise.all([
        ackService.getAll(),
        salesService.getAll(),
        salesService.getYieldAnalysis()
      ]);
      setAckProductions(acks);
      setByProductSales(sales);
      setYieldAnalysis(analysis);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestNextACK = async () => {
    try {
      const latest = await ackService.getLatestACK();
      if (latest) {
        const match = latest.ack_number.match(/(\d+)$/);
        if (match) {
          const nextNum = parseInt(match[1]) + 1;
          const prefix = latest.ack_number.substring(0, match.index);
          setAckFormData(prev => ({
            ...prev,
            ack_number: `${prefix}${nextNum.toString().padStart(match[1].length, '0')}`
          }));
        }
      }
    } catch (error) {
      console.error('Error getting latest ACK:', error);
    }
  };

  const handleACKSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await ackService.create({
        ack_number: ackFormData.ack_number,
        production_date: ackFormData.production_date,
        rice_type: ackFormData.rice_type,
        fortified_rice_qty: parseFloat(ackFormData.fortified_rice_qty),
        raw_rice_qty: parseFloat(ackFormData.raw_rice_qty),
        frk_qty: parseFloat(ackFormData.frk_qty),
        notes: ackFormData.notes
      });

      setAckFormData({
        ack_number: '',
        production_date: new Date().toISOString().split('T')[0],
        rice_type: 'raw',
        fortified_rice_qty: '290',
        raw_rice_qty: '287.1',
        frk_qty: '2.9',
        notes: ''
      });
      setShowACKForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving ACK:', error);
      alert('Failed to save ACK production');
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await salesService.create({
        sale_date: saleFormData.sale_date,
        byproduct_type: saleFormData.byproduct_type,
        quantity: parseFloat(saleFormData.quantity),
        from_ack_number: saleFormData.from_ack_number,
        to_ack_number: saleFormData.to_ack_number,
        ack_count: parseFloat(saleFormData.ack_count),
        rate: parseFloat(saleFormData.rate) || 0,
        notes: saleFormData.notes
      });

      setSaleFormData({
        sale_date: new Date().toISOString().split('T')[0],
        byproduct_type: 'broken_rice',
        quantity: '',
        from_ack_number: '',
        to_ack_number: '',
        ack_count: '',
        rate: '',
        notes: ''
      });
      setShowSaleForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Failed to save by-product sale');
    }
  };

  const handleDeleteACK = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ACK production record?')) return;

    try {
      await ackService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting ACK:', error);
      alert('Failed to delete ACK');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale record?')) return;

    try {
      await salesService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Failed to delete sale');
    }
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

  const calculateFRKPercentage = (raw: number, frk: number) => {
    const total = raw + frk;
    return total > 0 ? (frk / total) * 100 : 0;
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            Production & Yield Tracker
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track ACK production and by-product sales to calculate actual yields
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('ack')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            viewMode === 'ack'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-5 h-5" />
          ACK Production
        </button>
        <button
          onClick={() => setViewMode('sales')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            viewMode === 'sales'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          By-Product Sales & Yields
        </button>
      </div>

      {viewMode === 'ack' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowACKForm(!showACKForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showACKForm ? 'Cancel' : 'Record ACK'}
            </button>
          </div>

          {showACKForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Record ACK Production</h3>
              <form onSubmit={handleACKSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ACK Number *
                    </label>
                    <input
                      type="text"
                      value={ackFormData.ack_number}
                      onChange={(e) => setAckFormData({ ...ackFormData, ack_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ACK-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Date
                    </label>
                    <input
                      type="date"
                      value={ackFormData.production_date}
                      onChange={(e) => setAckFormData({ ...ackFormData, production_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rice Type
                    </label>
                    <select
                      value={ackFormData.rice_type}
                      onChange={(e) => setAckFormData({ ...ackFormData, rice_type: e.target.value as 'raw' | 'boiled' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="raw">Raw Rice</option>
                      <option value="boiled">Boiled Rice</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Fortified Rice Composition (in Qtls)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Raw Rice Quantity *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ackFormData.raw_rice_qty}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value) || 0;
                          const frk = parseFloat(ackFormData.frk_qty) || 0;
                          setAckFormData({
                            ...ackFormData,
                            raw_rice_qty: e.target.value,
                            fortified_rice_qty: (raw + frk).toFixed(2)
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="287.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FRK Quantity *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ackFormData.frk_qty}
                        onChange={(e) => {
                          const raw = parseFloat(ackFormData.raw_rice_qty) || 0;
                          const frk = parseFloat(e.target.value) || 0;
                          setAckFormData({
                            ...ackFormData,
                            frk_qty: e.target.value,
                            fortified_rice_qty: (raw + frk).toFixed(2)
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2.9"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Fortified Rice
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ackFormData.fortified_rice_qty}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        FRK: {formatNumber(calculateFRKPercentage(parseFloat(ackFormData.raw_rice_qty) || 0, parseFloat(ackFormData.frk_qty) || 0), 2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={ackFormData.notes}
                    onChange={(e) => setAckFormData({ ...ackFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any observations..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowACKForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save ACK
                  </button>
                </div>
              </form>
            </div>
          )}

          {ackProductions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No ACK Productions Yet</h3>
              <p className="text-gray-600 mb-4">
                Start recording your ACK production batches
              </p>
              <button
                onClick={() => setShowACKForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Record First ACK
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ackProductions.map((ack) => (
                <div key={ack.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-blue-600">{ack.ack_number}</h3>
                      <p className="text-xs text-gray-500">{formatDate(ack.production_date)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteACK(ack.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fortified:</span>
                      <span className="font-semibold text-gray-900">{formatNumber(ack.fortified_rice_qty)} Qtls</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Raw Rice:</span>
                      <span className="text-gray-700">{formatNumber(ack.raw_rice_qty)} Qtls</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">FRK ({formatNumber(calculateFRKPercentage(ack.raw_rice_qty, ack.frk_qty), 2)}%):</span>
                      <span className="text-gray-700">{formatNumber(ack.frk_qty)} Qtls</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                        {ack.rice_type}
                      </span>
                    </div>
                    {ack.notes && (
                      <p className="text-xs text-gray-600 italic pt-2 border-t">{ack.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">About ACK Production</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>1 ACK = 290 Qtls</strong> of Fortified Rice (typically 99% Raw Rice + 1% FRK)</p>
              <p>Record each ACK as you produce it with the exact raw rice and FRK quantities used.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSaleForm(!showSaleForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showSaleForm ? 'Cancel' : 'Record Sale'}
            </button>
          </div>

          {showSaleForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Record By-Product Sale</h3>
              <form onSubmit={handleSaleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Date
                    </label>
                    <input
                      type="date"
                      value={saleFormData.sale_date}
                      onChange={(e) => setSaleFormData({ ...saleFormData, sale_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      By-Product Type *
                    </label>
                    <select
                      value={saleFormData.byproduct_type}
                      onChange={(e) => setSaleFormData({ ...saleFormData, byproduct_type: e.target.value as ByProductType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      {Object.entries(BY_PRODUCT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Sold (Qtls) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={saleFormData.quantity}
                      onChange={(e) => setSaleFormData({ ...saleFormData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 75"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Rate (₹/Qtl)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={saleFormData.rate}
                      onChange={(e) => setSaleFormData({ ...saleFormData, rate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">ACK Range (Which ACKs did this come from?)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From ACK Number *
                      </label>
                      <input
                        type="text"
                        value={saleFormData.from_ack_number}
                        onChange={(e) => setSaleFormData({ ...saleFormData, from_ack_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., ACK-001"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To ACK Number *
                      </label>
                      <input
                        type="text"
                        value={saleFormData.to_ack_number}
                        onChange={(e) => setSaleFormData({ ...saleFormData, to_ack_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., ACK-005"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of ACKs *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={saleFormData.ack_count}
                        onChange={(e) => setSaleFormData({ ...saleFormData, ack_count: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 5"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={saleFormData.notes}
                    onChange={(e) => setSaleFormData({ ...saleFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any observations..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSaleForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Sale
                  </button>
                </div>
              </form>
            </div>
          )}

          {yieldAnalysis.length > 0 && yieldAnalysis.some(a => a.total_acks > 0) && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Yield Analysis (Based on Sales)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yieldAnalysis
                  .filter(a => a.total_acks > 0)
                  .map((analysis) => (
                    <div key={analysis.byproduct_type} className="bg-white rounded-lg p-4 shadow">
                      <h4 className="font-semibold text-gray-800 mb-3">{BY_PRODUCT_LABELS[analysis.byproduct_type]}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Sold:</span>
                          <span className="font-semibold">{formatNumber(analysis.total_quantity)} Qtls</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">From ACKs:</span>
                          <span className="font-semibold">{formatNumber(analysis.total_acks, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg per ACK:</span>
                          <span className="font-semibold">{formatNumber(analysis.avg_per_ack)} Qtls</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-600">Yield %:</span>
                          <span className="font-bold text-green-600">{formatNumber(analysis.yield_percentage)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {byProductSales.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No By-Product Sales Yet</h3>
              <p className="text-gray-600 mb-4">
                Record by-product sales to calculate yields
              </p>
              <button
                onClick={() => setShowSaleForm(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Record First Sale
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Recent Sales</h3>
              {byProductSales.map((sale) => (
                <div key={sale.id} className="bg-white rounded-lg shadow-md p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-800">{BY_PRODUCT_LABELS[sale.byproduct_type]}</h4>
                        <span className="text-sm text-gray-500">{formatDate(sale.sale_date)}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <div className="font-semibold text-gray-900">{formatNumber(sale.quantity)} Qtls</div>
                        </div>
                        <div>
                          <span className="text-gray-600">From ACKs:</span>
                          <div className="font-semibold text-gray-900">{sale.from_ack_number} to {sale.to_ack_number}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">ACK Count:</span>
                          <div className="font-semibold text-gray-900">{formatNumber(sale.ack_count, 0)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Per ACK:</span>
                          <div className="font-semibold text-green-600">{formatNumber(sale.quantity / sale.ack_count)} Qtls</div>
                        </div>
                      </div>
                      {sale.rate > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Sale Value: </span>
                          <span className="font-semibold text-gray-900">₹{formatNumber(sale.quantity * sale.rate, 0)}</span>
                          <span className="text-gray-500"> @ ₹{formatNumber(sale.rate)}/Qtl</span>
                        </div>
                      )}
                      {sale.notes && (
                        <p className="text-xs text-gray-600 italic mt-2">{sale.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">How By-Product Sales Work</h4>
            <div className="text-xs text-yellow-800 space-y-1">
              <p><strong>Step 1:</strong> When you sell a by-product, record the quantity</p>
              <p><strong>Step 2:</strong> Specify which ACKs this by-product came from (e.g., ACK-001 to ACK-005 = 5 ACKs)</p>
              <p><strong>Step 3:</strong> The system calculates: Quantity per ACK and Yield % = (Qty per ACK / 290) × 100</p>
              <p className="mt-2"><strong>Example:</strong> If you sold 75 Qtls of broken rice from 5 ACKs, that's 15 Qtls per ACK = 5.17% yield</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
