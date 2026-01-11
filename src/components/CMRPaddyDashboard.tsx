import { useState, useEffect } from 'react';
import { Plus, RefreshCw, TrendingUp, Package, Truck, CheckCircle, Upload } from 'lucide-react';
import { CMRSeasonService } from '../services/CMRSeasonService';
import { CMRPaddyReceiptService } from '../services/CMRPaddyReceiptService';
import { CMRDeliveryService } from '../services/CMRDeliveryService';
import CMRDataImport from './CMRDataImport';
import type { CMRSeasonSummary } from '../types';

const cmrSeasonService = new CMRSeasonService();
const receiptService = new CMRPaddyReceiptService();
const deliveryService = new CMRDeliveryService();

export default function CMRPaddyDashboard() {
  const [selectedSeason, setSelectedSeason] = useState('Rabi 24-25');
  const [seasonData, setSeasonData] = useState<CMRSeasonSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    receipt_date: new Date().toISOString().split('T')[0],
    paddy_quantity_qtls: '',
    vehicle_number: '',
    supplier: '',
    notes: ''
  });

  const [deliveryForm, setDeliveryForm] = useState({
    delivery_date: new Date().toISOString().split('T')[0],
    ack_number: '',
    destination_pool: 'fci',
    variety: 'raw',
    cmr_quantity_qtls: '290',
    vehicle_number: '',
    driver_name: '',
    notes: ''
  });

  const SEASONS = ['Kharif 25-26', 'Rabi 24-25', 'Kharif 24-25', 'Rabi 23-24'];

  useEffect(() => {
    loadSeasonData();
  }, [selectedSeason]);

  const loadSeasonData = async () => {
    setLoading(true);
    try {
      const data = await cmrSeasonService.getSeasonSummary(selectedSeason);
      setSeasonData(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error loading season data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReceipt = async () => {
    try {
      await receiptService.addReceipt({
        ...receiptForm,
        paddy_quantity_qtls: parseFloat(receiptForm.paddy_quantity_qtls),
        season: selectedSeason
      });
      setShowReceiptModal(false);
      setReceiptForm({
        receipt_date: new Date().toISOString().split('T')[0],
        paddy_quantity_qtls: '',
        vehicle_number: '',
        supplier: '',
        notes: ''
      });
      await loadSeasonData();
      alert('Paddy receipt recorded successfully!');
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Failed to save receipt: ' + (error as Error).message);
    }
  };

  const handleSaveDelivery = async () => {
    try {
      await deliveryService.addDelivery({
        ...deliveryForm,
        cmr_quantity_qtls: parseFloat(deliveryForm.cmr_quantity_qtls),
        season: selectedSeason,
        delivery_status: 'delivered',
        gate_in_status: false,
        dumping_status: 'pending_ds'
      });
      setShowDeliveryModal(false);
      setDeliveryForm({
        delivery_date: new Date().toISOString().split('T')[0],
        ack_number: '',
        destination_pool: 'fci',
        variety: 'raw',
        cmr_quantity_qtls: '290',
        vehicle_number: '',
        driver_name: '',
        notes: ''
      });
      await loadSeasonData();
      alert('CMR delivery recorded successfully!');
    } catch (error) {
      console.error('Error saving delivery:', error);
      alert('Failed to save delivery: ' + (error as Error).message);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/\//g, '-').replace(',', '');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <label className="text-gray-500 text-sm font-medium tracking-wide">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/10 cursor-pointer text-sm font-medium"
          >
            {SEASONS.map(season => (
              <option key={season} value={season} className="bg-[#111111]">{season}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">Last updated</span>
          <time className="text-white font-medium">{formatDateTime(lastRefreshed)}</time>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowReceiptModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm font-medium"
        >
          <Plus size={18} />
          Record Paddy Receipt
        </button>
        <button
          onClick={() => setShowDeliveryModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-medium"
        >
          <Truck size={18} />
          Record CMR Delivery
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all shadow-lg shadow-purple-500/20 text-sm font-medium"
        >
          <Upload size={18} />
          Import 99 ACKs
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-blue-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Paddy Received</h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-gray-500 text-xs mb-1.5 font-medium">Paddy (Qtls)</div>
                  <div className="text-white text-3xl font-bold tracking-tight">
                    {formatNumber(seasonData?.paddy_received_qtls || 0)}
                  </div>
                </div>
                <div className="pt-5 border-t border-white/5">
                  <div className="text-gray-500 text-xs mb-1.5 font-medium">Resultant CMR (Qtls)</div>
                  <div className="text-white text-3xl font-bold tracking-tight">
                    {formatNumber(seasonData?.resultant_cmr_qtls || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Balance to Deliver</h3>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-gray-500 text-xs mb-1.5 font-medium">Paddy (Qtls)</div>
                  <div className="text-white text-3xl font-bold tracking-tight">
                    {formatNumber(seasonData?.paddy_balance_qtls || 0)}
                  </div>
                </div>
                <div className="pt-5 border-t border-white/5">
                  <div className="text-gray-500 text-xs mb-1.5 font-medium">Resultant CMR (Qtls)</div>
                  <div className="text-white text-3xl font-bold tracking-tight">
                    {formatNumber(seasonData?.cmr_balance_qtls || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">CMR Delivered</h3>
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">FCI Raw</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.cmr_delivered_fci_raw || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">FCI Boiled</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.cmr_delivered_fci_boiled || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">Central Pool</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.cmr_delivered_central_pool || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">State Pool</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.cmr_delivered_state_pool || 0)}</span>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-slate-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Paddy Delivered</h3>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">FCI Raw</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.paddy_delivered_fci_raw || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">FCI Boiled</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.paddy_delivered_fci_boiled || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">Central Pool</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.paddy_delivered_central_pool || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-medium">State Pool</span>
                  <span className="text-white font-semibold text-sm">{formatNumber(seasonData?.paddy_delivered_state_pool || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Total ACKs</h3>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">FCI</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.acks_fci || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">Central</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.acks_central_pool || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">State</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.acks_state_pool || 0}</div>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Gate In</h3>
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">FCI</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.gate_in_fci || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">Central</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.gate_in_central_pool || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">State</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.gate_in_state_pool || 0}</div>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Pending DS</h3>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">FCI</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.pending_dumping_ds_fci || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">Central</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.pending_dumping_ds_central_pool || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">State</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.pending_dumping_ds_state_pool || 0}</div>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400 tracking-wide uppercase">Pending MD</h3>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">FCI</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.pending_dumping_md_fci || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">Central</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.pending_dumping_md_central_pool || 0}</div>
                </div>
                <div className="text-center border-l border-white/5 pl-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 font-medium">State</div>
                  <div className="text-white text-2xl font-bold">{seasonData?.pending_dumping_md_state_pool || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-bold mb-4">Record Paddy Receipt</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Date</label>
                <input
                  type="date"
                  value={receiptForm.receipt_date}
                  onChange={(e) => setReceiptForm({...receiptForm, receipt_date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Paddy Quantity (Qtls)*</label>
                <input
                  type="number"
                  step="0.01"
                  value={receiptForm.paddy_quantity_qtls}
                  onChange={(e) => setReceiptForm({...receiptForm, paddy_quantity_qtls: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="Enter quantity"
                />
                <p className="text-xs text-gray-500 mt-1">Expected CMR: {(parseFloat(receiptForm.paddy_quantity_qtls || '0') * 0.67).toFixed(2)} Qtls</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Vehicle Number</label>
                <input
                  type="text"
                  value={receiptForm.vehicle_number}
                  onChange={(e) => setReceiptForm({...receiptForm, vehicle_number: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="e.g., AP 01 AB 1234"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Supplier</label>
                <input
                  type="text"
                  value={receiptForm.supplier}
                  onChange={(e) => setReceiptForm({...receiptForm, supplier: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Notes</label>
                <textarea
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({...receiptForm, notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1 h-20"
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveReceipt}
                disabled={!receiptForm.paddy_quantity_qtls}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-bold mb-4">Record CMR Delivery</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Delivery Date</label>
                <input
                  type="date"
                  value={deliveryForm.delivery_date}
                  onChange={(e) => setDeliveryForm({...deliveryForm, delivery_date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">ACK Number*</label>
                <input
                  type="text"
                  value={deliveryForm.ack_number}
                  onChange={(e) => setDeliveryForm({...deliveryForm, ack_number: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="e.g., ACK001"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm">Destination Pool</label>
                  <select
                    value={deliveryForm.destination_pool}
                    onChange={(e) => setDeliveryForm({...deliveryForm, destination_pool: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  >
                    <option value="fci">FCI</option>
                    <option value="central">Central Pool</option>
                    <option value="state">State Pool</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Variety</label>
                  <select
                    value={deliveryForm.variety}
                    onChange={(e) => setDeliveryForm({...deliveryForm, variety: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  >
                    <option value="raw">Raw</option>
                    <option value="boiled">Boiled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">CMR Quantity (Qtls)*</label>
                <input
                  type="number"
                  step="0.01"
                  value={deliveryForm.cmr_quantity_qtls}
                  onChange={(e) => setDeliveryForm({...deliveryForm, cmr_quantity_qtls: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="290"
                />
                <p className="text-xs text-gray-500 mt-1">Paddy consumed: {(parseFloat(deliveryForm.cmr_quantity_qtls || '0') / 0.67).toFixed(2)} Qtls</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Vehicle Number</label>
                <input
                  type="text"
                  value={deliveryForm.vehicle_number}
                  onChange={(e) => setDeliveryForm({...deliveryForm, vehicle_number: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="e.g., AP 01 AB 1234"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Driver Name</label>
                <input
                  type="text"
                  value={deliveryForm.driver_name}
                  onChange={(e) => setDeliveryForm({...deliveryForm, driver_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl mt-1"
                  placeholder="Driver name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveDelivery}
                disabled={!deliveryForm.ack_number || !deliveryForm.cmr_quantity_qtls}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Delivery
              </button>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CMRDataImport />
            <button
              onClick={() => {
                setShowImportModal(false);
                loadSeasonData();
              }}
              className="mt-4 w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
