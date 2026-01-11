import { useState, useEffect } from 'react';
import { Save, Edit, RefreshCw, BarChart2, TrendingUp, Package, Truck } from 'lucide-react';
import { CMRSeasonService } from '../services/CMRSeasonService';
import type { CMRSeasonSummary } from '../types';

const SEASONS = ['Kharif 25-26', 'Rabi 24-25', 'Kharif 24-25', 'Rabi 23-24', 'Kharif 23-24'];

export default function CMRSeasonDetails() {
  const [selectedSeason, setSelectedSeason] = useState('Rabi 24-25');
  const [seasonData, setSeasonData] = useState<CMRSeasonSummary | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    paddy_received_qtls: '',
    resultant_cmr_qtls: '',
    paddy_balance_qtls: '',
    cmr_balance_qtls: '',
    cmr_delivered_fci_raw: '',
    cmr_delivered_fci_boiled: '',
    cmr_delivered_central_pool: '',
    cmr_delivered_state_pool: '',
    paddy_delivered_fci_raw: '',
    paddy_delivered_fci_boiled: '',
    paddy_delivered_central_pool: '',
    paddy_delivered_state_pool: '',
    acks_fci: '',
    acks_central_pool: '',
    acks_state_pool: '',
    gate_in_fci: '',
    gate_in_central_pool: '',
    gate_in_state_pool: '',
    pending_dumping_ds_fci: '',
    pending_dumping_ds_central_pool: '',
    pending_dumping_ds_state_pool: '',
    pending_dumping_md_fci: '',
    pending_dumping_md_central_pool: '',
    pending_dumping_md_state_pool: '',
    notes: ''
  });

  const seasonService = new CMRSeasonService();

  useEffect(() => {
    loadSeasonData();
  }, [selectedSeason]);

  const loadSeasonData = async () => {
    try {
      setLoading(true);
      const data = await seasonService.getOrCreateSeason(selectedSeason);
      setSeasonData(data);

      setFormData({
        paddy_received_qtls: data.paddy_received_qtls.toString(),
        resultant_cmr_qtls: data.resultant_cmr_qtls.toString(),
        paddy_balance_qtls: data.paddy_balance_qtls.toString(),
        cmr_balance_qtls: data.cmr_balance_qtls.toString(),
        cmr_delivered_fci_raw: data.cmr_delivered_fci_raw.toString(),
        cmr_delivered_fci_boiled: data.cmr_delivered_fci_boiled.toString(),
        cmr_delivered_central_pool: data.cmr_delivered_central_pool.toString(),
        cmr_delivered_state_pool: data.cmr_delivered_state_pool.toString(),
        paddy_delivered_fci_raw: data.paddy_delivered_fci_raw.toString(),
        paddy_delivered_fci_boiled: data.paddy_delivered_fci_boiled.toString(),
        paddy_delivered_central_pool: data.paddy_delivered_central_pool.toString(),
        paddy_delivered_state_pool: data.paddy_delivered_state_pool.toString(),
        acks_fci: data.acks_fci.toString(),
        acks_central_pool: data.acks_central_pool.toString(),
        acks_state_pool: data.acks_state_pool.toString(),
        gate_in_fci: data.gate_in_fci.toString(),
        gate_in_central_pool: data.gate_in_central_pool.toString(),
        gate_in_state_pool: data.gate_in_state_pool.toString(),
        pending_dumping_ds_fci: data.pending_dumping_ds_fci.toString(),
        pending_dumping_ds_central_pool: data.pending_dumping_ds_central_pool.toString(),
        pending_dumping_ds_state_pool: data.pending_dumping_ds_state_pool.toString(),
        pending_dumping_md_fci: data.pending_dumping_md_fci.toString(),
        pending_dumping_md_central_pool: data.pending_dumping_md_central_pool.toString(),
        pending_dumping_md_state_pool: data.pending_dumping_md_state_pool.toString(),
        notes: data.notes
      });
    } catch (error) {
      console.error('Error loading season data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await seasonService.updateSeasonData(selectedSeason, {
        paddy_received_qtls: parseFloat(formData.paddy_received_qtls) || 0,
        resultant_cmr_qtls: parseFloat(formData.resultant_cmr_qtls) || 0,
        paddy_balance_qtls: parseFloat(formData.paddy_balance_qtls) || 0,
        cmr_balance_qtls: parseFloat(formData.cmr_balance_qtls) || 0,
        cmr_delivered_fci_raw: parseFloat(formData.cmr_delivered_fci_raw) || 0,
        cmr_delivered_fci_boiled: parseFloat(formData.cmr_delivered_fci_boiled) || 0,
        cmr_delivered_central_pool: parseFloat(formData.cmr_delivered_central_pool) || 0,
        cmr_delivered_state_pool: parseFloat(formData.cmr_delivered_state_pool) || 0,
        paddy_delivered_fci_raw: parseFloat(formData.paddy_delivered_fci_raw) || 0,
        paddy_delivered_fci_boiled: parseFloat(formData.paddy_delivered_fci_boiled) || 0,
        paddy_delivered_central_pool: parseFloat(formData.paddy_delivered_central_pool) || 0,
        paddy_delivered_state_pool: parseFloat(formData.paddy_delivered_state_pool) || 0,
        acks_fci: parseInt(formData.acks_fci) || 0,
        acks_central_pool: parseInt(formData.acks_central_pool) || 0,
        acks_state_pool: parseInt(formData.acks_state_pool) || 0,
        gate_in_fci: parseInt(formData.gate_in_fci) || 0,
        gate_in_central_pool: parseInt(formData.gate_in_central_pool) || 0,
        gate_in_state_pool: parseInt(formData.gate_in_state_pool) || 0,
        pending_dumping_ds_fci: parseInt(formData.pending_dumping_ds_fci) || 0,
        pending_dumping_ds_central_pool: parseInt(formData.pending_dumping_ds_central_pool) || 0,
        pending_dumping_ds_state_pool: parseInt(formData.pending_dumping_ds_state_pool) || 0,
        pending_dumping_md_fci: parseInt(formData.pending_dumping_md_fci) || 0,
        pending_dumping_md_central_pool: parseInt(formData.pending_dumping_md_central_pool) || 0,
        pending_dumping_md_state_pool: parseInt(formData.pending_dumping_md_state_pool) || 0,
        notes: formData.notes,
        last_updated: new Date().toISOString()
      });
      await loadSeasonData();
      setEditing(false);
    } catch (error) {
      console.error('Error saving season data:', error);
      alert('Failed to save season data');
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleInitializeBaseline = async () => {
    if (!confirm(`Initialize baseline data for ${selectedSeason}? This will add opening balance data.`)) {
      return;
    }
    try {
      setLoading(true);
      await seasonService.initializeBaselineData(selectedSeason);
      await loadSeasonData();
      alert('Baseline data initialized successfully!');
    } catch (error) {
      console.error('Error initializing baseline:', error);
      alert('Failed to initialize baseline data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading season data...</div>
      </div>
    );
  }

  const totals = seasonData ? seasonService.calculateTotals(seasonData) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">CMR Paddy Overview</h2>
          <p className="text-sm text-gray-400 mt-1">
            Track paddy receipts, CMR deliveries, and ACK progress for each season
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSeasonData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {selectedSeason === 'Rabi 24-25' && seasonData && seasonData.paddy_received_qtls === 0 && (
            <button
              onClick={handleInitializeBaseline}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Initialize Baseline
            </button>
          )}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Data
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={editing}
          >
            {SEASONS.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {seasonData && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">Last Updated:</span> {formatDate(seasonData.last_updated)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Paddy Received by Mill
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-green-200">Paddy</div>
              {editing ? (
                <input
                  type="number"
                  step="0.01"
                  value={formData.paddy_received_qtls}
                  onChange={(e) => setFormData({ ...formData, paddy_received_qtls: e.target.value })}
                  className="w-full px-2 py-1 text-2xl font-bold bg-white/20 border border-white/30 rounded text-white"
                />
              ) : (
                <div className="text-3xl font-bold">{formatNumber(seasonData?.paddy_received_qtls || 0)}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-green-200">Resultant CMR</div>
              {editing ? (
                <input
                  type="number"
                  step="0.01"
                  value={formData.resultant_cmr_qtls}
                  onChange={(e) => setFormData({ ...formData, resultant_cmr_qtls: e.target.value })}
                  className="w-full px-2 py-1 text-2xl font-bold bg-white/20 border border-white/30 rounded text-white"
                />
              ) : (
                <div className="text-3xl font-bold">{formatNumber(seasonData?.resultant_cmr_qtls || 0)}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Balance To be Delivered
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-emerald-200">Paddy</div>
              {editing ? (
                <input
                  type="number"
                  step="0.01"
                  value={formData.paddy_balance_qtls}
                  onChange={(e) => setFormData({ ...formData, paddy_balance_qtls: e.target.value })}
                  className="w-full px-2 py-1 text-2xl font-bold bg-white/20 border border-white/30 rounded text-white"
                />
              ) : (
                <div className="text-3xl font-bold">{formatNumber(seasonData?.paddy_balance_qtls || 0)}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-emerald-200">Resultant CMR</div>
              {editing ? (
                <input
                  type="number"
                  step="0.01"
                  value={formData.cmr_balance_qtls}
                  onChange={(e) => setFormData({ ...formData, cmr_balance_qtls: e.target.value })}
                  className="w-full px-2 py-1 text-2xl font-bold bg-white/20 border border-white/30 rounded text-white"
                />
              ) : (
                <div className="text-3xl font-bold">{formatNumber(seasonData?.cmr_balance_qtls || 0)}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-600 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            CMR Delivered (Qtls)
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'FCI Raw', key: 'cmr_delivered_fci_raw' as const },
              { label: 'FCI Boiled', key: 'cmr_delivered_fci_boiled' as const },
              { label: 'Central Pool', key: 'cmr_delivered_central_pool' as const },
              { label: 'State Pool', key: 'cmr_delivered_state_pool' as const }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span className="text-rose-200">{item.label}</span>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                    className="w-28 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-right font-semibold"
                  />
                ) : (
                  <span className="font-bold">{formatNumber(seasonData?.[item.key] || 0)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Paddy Delivered (Qtls)
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'FCI Raw', key: 'paddy_delivered_fci_raw' as const },
              { label: 'FCI Boiled', key: 'paddy_delivered_fci_boiled' as const },
              { label: 'Central Pool', key: 'paddy_delivered_central_pool' as const },
              { label: 'State Pool', key: 'paddy_delivered_state_pool' as const }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span className="text-gray-400">{item.label}</span>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                    className="w-28 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-right font-semibold"
                  />
                ) : (
                  <span className="font-bold">{formatNumber(seasonData?.[item.key] || 0)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-700 to-orange-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Total ACKs</h3>
          <div className="space-y-3">
            {[
              { label: 'FCI', key: 'acks_fci' as const },
              { label: 'Central Pool', key: 'acks_central_pool' as const },
              { label: 'State Pool', key: 'acks_state_pool' as const }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span className="text-amber-200">{item.label}</span>
                {editing ? (
                  <input
                    type="number"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                    className="w-20 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-right font-bold text-xl"
                  />
                ) : (
                  <span className="font-bold text-xl">{seasonData?.[item.key] || 0}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-700 to-purple-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Gate In</h3>
          <div className="space-y-3">
            {[
              { label: 'FCI', key: 'gate_in_fci' as const },
              { label: 'Central Pool', key: 'gate_in_central_pool' as const },
              { label: 'State Pool', key: 'gate_in_state_pool' as const }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span className="text-violet-200">{item.label}</span>
                {editing ? (
                  <input
                    type="number"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                    className="w-20 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-right font-bold text-xl"
                  />
                ) : (
                  <span className="font-bold text-xl">{seasonData?.[item.key] || 0}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-700 to-teal-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Pending at Dumping (DS)</h3>
          <div className="space-y-3">
            {[
              { label: 'FCI', key: 'pending_dumping_ds_fci' as const },
              { label: 'Central Pool', key: 'pending_dumping_ds_central_pool' as const },
              { label: 'State Pool', key: 'pending_dumping_ds_state_pool' as const }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span className="text-cyan-200">{item.label}</span>
                {editing ? (
                  <input
                    type="number"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                    className="w-20 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-right font-bold text-xl"
                  />
                ) : (
                  <span className="font-bold text-xl">{seasonData?.[item.key] || 0}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Pending at Dumping (MD)</h3>
          <div className="space-y-3">
            {[
              { label: 'FCI', key: 'pending_dumping_md_fci' as const },
              { label: 'Central Pool', key: 'pending_dumping_md_central_pool' as const },
              { label: 'State Pool', key: 'pending_dumping_md_state_pool' as const }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span className="text-blue-200">{item.label}</span>
                {editing ? (
                  <input
                    type="number"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                    className="w-20 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-right font-bold text-xl"
                  />
                ) : (
                  <span className="font-bold text-xl">{seasonData?.[item.key] || 0}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {totals && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Season Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-blue-200 text-sm mb-1">Total CMR Delivered</div>
              <div className="text-3xl font-bold">{formatNumber(totals.totalCMRDelivered)}</div>
              <div className="text-blue-200 text-xs">Quintals</div>
            </div>
            <div>
              <div className="text-blue-200 text-sm mb-1">Total Paddy Delivered</div>
              <div className="text-3xl font-bold">{formatNumber(totals.totalPaddyDelivered)}</div>
              <div className="text-blue-200 text-xs">Quintals</div>
            </div>
            <div>
              <div className="text-blue-200 text-sm mb-1">Total ACKs</div>
              <div className="text-3xl font-bold">{totals.totalACKs}</div>
              <div className="text-blue-200 text-xs">Count</div>
            </div>
            <div>
              <div className="text-blue-200 text-sm mb-1">Delivery Progress</div>
              <div className="text-3xl font-bold">{totals.deliveryProgress.toFixed(1)}%</div>
              <div className="w-full bg-blue-800 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(totals.deliveryProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Additional notes about this season..."
          />
        </div>
      )}
    </div>
  );
}
