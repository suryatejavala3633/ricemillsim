import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { ElectricityService } from '../services/ElectricityService';
import type { ElectricityReading, PowerFactorCalculation } from '../types';

export default function PowerFactorTracker() {
  const [readings, setReadings] = useState<PowerFactorCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    kwh_reading: '',
    kvah_reading: '',
    is_bill_reading: false,
    notes: ''
  });

  const electricityService = new ElectricityService();

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      setLoading(true);
      const data = await electricityService.getReadingsWithPF();
      setReadings(data);
    } catch (error) {
      console.error('Error loading readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await electricityService.create({
        reading_date: new Date(formData.reading_date).toISOString(),
        kwh_reading: parseFloat(formData.kwh_reading),
        kvah_reading: parseFloat(formData.kvah_reading),
        is_bill_reading: formData.is_bill_reading,
        notes: formData.notes
      });

      setFormData({
        reading_date: new Date().toISOString().split('T')[0],
        kwh_reading: '',
        kvah_reading: '',
        is_bill_reading: false,
        notes: ''
      });
      setShowForm(false);
      await loadReadings();
    } catch (error) {
      console.error('Error saving reading:', error);
      alert('Failed to save reading');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading?')) return;

    try {
      await electricityService.delete(id);
      await loadReadings();
    } catch (error) {
      console.error('Error deleting reading:', error);
      alert('Failed to delete reading');
    }
  };

  const getPFStatus = (pf: number) => {
    if (pf >= 0.95) return { color: 'text-green-600', icon: TrendingUp, label: 'Excellent' };
    if (pf >= 0.90) return { color: 'text-blue-600', icon: TrendingUp, label: 'Good' };
    if (pf >= 0.85) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Fair' };
    return { color: 'text-red-600', icon: TrendingDown, label: 'Poor' };
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
            <Zap className="w-7 h-7 text-yellow-500" />
            Power Factor Tracker
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor daily electricity readings and power factor performance
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Reading'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Electricity Reading</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reading Date
                </label>
                <input
                  type="date"
                  value={formData.reading_date}
                  onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bill_reading}
                    onChange={(e) => setFormData({ ...formData, is_bill_reading: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    This is from electricity bill
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KWH Reading
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.kwh_reading}
                  onChange={(e) => setFormData({ ...formData, kwh_reading: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 12500.50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KVAH Reading
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.kvah_reading}
                  onChange={(e) => setFormData({ ...formData, kvah_reading: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 13200.75"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Reading
              </button>
            </div>
          </form>
        </div>
      )}

      {readings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Readings Yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking your power factor by adding your first electricity reading
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Reading
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KWH
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KVAH
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                    Interval PF (from previous)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                    Monthly PF (from bill)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-t">
                    PF
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-t">
                    Status
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-t">
                    PF
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-t">
                    Status
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.map((calc) => {
                  const intervalPFStatus = getPFStatus(calc.power_factor);
                  const IntervalStatusIcon = intervalPFStatus.icon;

                  const monthlyPFStatus = getPFStatus(calc.monthly_power_factor);
                  const MonthlyStatusIcon = monthlyPFStatus.icon;

                  return (
                    <tr key={calc.reading.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(calc.reading.reading_date)}
                          </span>
                          {calc.reading.is_bill_reading && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Bill
                            </span>
                          )}
                        </div>
                        {calc.reading.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">{calc.reading.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-mono">
                        {formatNumber(calc.reading.kwh_reading)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-mono">
                        {formatNumber(calc.reading.kvah_reading)}
                      </td>

                      <td className="px-4 py-3 text-center bg-blue-50">
                        {calc.power_factor > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className={`text-lg font-bold ${intervalPFStatus.color}`}>
                              {formatNumber(calc.power_factor, 3)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {calc.days_diff} days
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center bg-blue-50">
                        {calc.power_factor > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <IntervalStatusIcon className={`w-4 h-4 ${intervalPFStatus.color}`} />
                            <span className={`text-xs font-medium ${intervalPFStatus.color}`}>
                              {intervalPFStatus.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center bg-green-50">
                        {calc.monthly_power_factor > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className={`text-lg font-bold ${monthlyPFStatus.color}`}>
                              {formatNumber(calc.monthly_power_factor, 3)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {calc.monthly_days_diff} days
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center bg-green-50">
                        {calc.monthly_power_factor > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <MonthlyStatusIcon className={`w-4 h-4 ${monthlyPFStatus.color}`} />
                            <span className={`text-xs font-medium ${monthlyPFStatus.color}`}>
                              {monthlyPFStatus.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(calc.reading.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                          title="Delete reading"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            Interval PF (Daily Changes)
          </h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Purpose:</strong> Track day-to-day power factor fluctuations</p>
            <p><strong>Calculated from:</strong> Previous reading to current reading</p>
            <p><strong>Use case:</strong> Identify daily patterns and sudden changes in power usage</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            Monthly PF (Overall Performance)
          </h4>
          <div className="text-xs text-green-800 space-y-1">
            <p><strong>Purpose:</strong> Monitor overall monthly power factor performance</p>
            <p><strong>Calculated from:</strong> Last bill reading to current reading</p>
            <p><strong>Use case:</strong> Compare against bill and track cumulative efficiency</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Power Factor Rating Scale</h4>
        <div className="text-xs text-gray-800 space-y-1">
          <p><strong>Formula:</strong> PF = KWH Difference / KVAH Difference</p>
          <p><strong>Excellent (0.95+):</strong> Optimal efficiency, minimal reactive power</p>
          <p><strong>Good (0.90-0.94):</strong> Acceptable performance</p>
          <p><strong>Fair (0.85-0.89):</strong> Room for improvement</p>
          <p><strong>Poor (&lt;0.85):</strong> Action needed, high reactive power usage</p>
        </div>
      </div>
    </div>
  );
}
