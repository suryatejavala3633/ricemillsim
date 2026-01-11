import { useState, useEffect } from 'react';
import { Users, Plus, Save, X, Search, Edit, Trash2, AlertCircle, FileText } from 'lucide-react';
import { HamaliWorkService } from '../services/HamaliWorkService';

interface HamaliWork {
  id: string;
  work_date: string;
  work_type: string;
  worker_name: string;
  material_type: string;
  quantity_qtls: number;
  bags_count: number;
  rate_per_qtl: number;
  rate_per_bag: number;
  total_amount: number;
  ack_reference: string;
  payment_status: string;
  payment_date: string | null;
  notes: string;
}

const hamaliService = new HamaliWorkService();

const HAMALI_RATES = {
  paddy: [
    { work: 'PADDY UNLOADING TO NET / NET TO LOADING With Batha', rate: 3.50, unit: 'PER BAG' },
    { work: 'PADDY DIRECT BATTI', rate: 4.00, unit: 'PER BAG' },
    { work: 'PADDY NET TO BATTI', rate: 4.00, unit: 'PER BAG' },
    { work: 'PADDY LOOSE FILLING TO PC', rate: 2.00, unit: 'PER BAG' },
    { work: 'PADDY LOADING WITH VEHICLE TO PC', rate: 5.20, unit: 'PER BAG' },
    { work: 'PADDY LOOSE FILLING + NET OR PC CUTTING', rate: 4.00, unit: 'PER TON' },
  ],
  rice: [
    { work: 'FCI RICE NET/LOADING+KANTA+CHAPA+STITCHING+STENCIL + BATHA', rate: 6.00, unit: 'PER BAG' },
    { work: 'RICE 26KG KANTA+STITCHING TO NET/LOADING', rate: 2.50, unit: 'PER BAG' },
    { work: 'RICE 26KGS NET TO LOADING', rate: 1.60, unit: 'PER BAG' },
    { work: 'RICE NET TO LOADING/UNLOADING', rate: 2.00, unit: 'PER BAG' },
    { work: 'RICE UNLOADING & PALTY/NET', rate: 2.30, unit: 'PER BAG' },
  ],
  bran: [
    { work: 'BRAN FILLING & LOADING', rate: 120.00, unit: 'PER TON' },
    { work: 'BRAN LOADING MAMUL', rate: 20.00, unit: 'PER TON' },
  ],
  brokenRice: [
    { work: 'BROKEN RICE FILLING & NET/LOADING', rate: 4.00, unit: 'PER BAG' },
    { work: 'BROKEN RICE FILLING, KANTA & NET/LOADING', rate: 5.00, unit: 'PER BAG' },
    { work: 'BROKEN RICE LOADING MAMUL', rate: 20.00, unit: 'PER TON' },
    { work: 'BROKEN RICE NET TO LOADING', rate: 2.00, unit: 'PER BAG' },
  ],
  param: [
    { work: 'PARAM FILLING & NET/LOADING', rate: 100.00, unit: 'PER TON' },
    { work: 'PARAM LOADING MAMUL', rate: 20.00, unit: 'PER TON' },
    { work: 'PARAM NET TO LOADING', rate: 2.00, unit: 'PER BAG' },
  ],
  others: [
    { work: 'FRK LORRY UNLOADING', rate: 1.60, unit: 'PER BAG' },
    { work: 'FRK BLENDER LOADING', rate: 1.00, unit: 'PER BAG' },
    { work: 'NEW GUNNIES BALES UNLOADING', rate: 25.00, unit: 'PER BALE' },
    { work: 'GUNNIES BUNDELING AND NET', rate: 2.00, unit: 'PER BUNDLE' },
    { work: 'PADDY/RICE/BROKENRICE/ NET TO PALTY', rate: 1.50, unit: 'PER BAG' },
    { work: 'HOPPER LOADING (BROKEN, REJECTION, RICE)', rate: 3.00, unit: 'PER BAG' },
  ],
};

export default function HamaliWorkManager() {
  const [records, setRecords] = useState<HamaliWork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showRateSheet, setShowRateSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    work_date: new Date().toISOString().split('T')[0],
    work_type: 'loading',
    worker_name: '',
    material_type: 'paddy',
    quantity_qtls: 0,
    bags_count: 0,
    rate_per_qtl: 0,
    rate_per_bag: 0,
    total_amount: 0,
    ack_reference: '',
    payment_status: 'pending',
    payment_date: null as string | null,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [
    formData.quantity_qtls,
    formData.bags_count,
    formData.rate_per_qtl,
    formData.rate_per_bag,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await hamaliService.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Error loading hamali records:', error);
      alert('Failed to load hamali records');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const qtlTotal = formData.quantity_qtls * formData.rate_per_qtl;
    const bagTotal = formData.bags_count * formData.rate_per_bag;
    setFormData((prev) => ({ ...prev, total_amount: qtlTotal + bagTotal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await hamaliService.update(editingId, formData);
      } else {
        await hamaliService.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving hamali record:', error);
      alert('Failed to save hamali record');
    }
  };

  const handleEdit = (record: HamaliWork) => {
    setFormData({
      work_date: record.work_date,
      work_type: record.work_type,
      worker_name: record.worker_name,
      material_type: record.material_type,
      quantity_qtls: record.quantity_qtls,
      bags_count: record.bags_count,
      rate_per_qtl: record.rate_per_qtl,
      rate_per_bag: record.rate_per_bag,
      total_amount: record.total_amount,
      ack_reference: record.ack_reference,
      payment_status: record.payment_status,
      payment_date: record.payment_date,
      notes: record.notes,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await hamaliService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const resetForm = () => {
    setFormData({
      work_date: new Date().toISOString().split('T')[0],
      work_type: 'loading',
      worker_name: '',
      material_type: 'paddy',
      quantity_qtls: 0,
      bags_count: 0,
      rate_per_qtl: 0,
      rate_per_bag: 0,
      total_amount: 0,
      ack_reference: '',
      payment_status: 'pending',
      payment_date: null,
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ack_reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || record.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredRecords.reduce((sum, r) => sum + r.total_amount, 0);
  const totalPaid = filteredRecords
    .filter((r) => r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.total_amount, 0);
  const totalPending = filteredRecords
    .filter((r) => r.payment_status === 'pending')
    .reduce((sum, r) => sum + r.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Hamali Work</h2>
              <p className="text-gray-400 text-sm">
                Track loading, unloading, and shifting work
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRateSheet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl transition-all text-sm"
            >
              <FileText size={16} />
              Rate Sheet
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-amber-500/20"
            >
              <Plus size={16} />
              Add Work Record
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
            <div className="text-amber-400 text-xs font-medium uppercase tracking-wide mb-1">
              Total Amount
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-emerald-400 text-xs font-medium uppercase tracking-wide mb-1">
              Total Paid
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4">
            <div className="text-red-400 text-xs font-medium uppercase tracking-wide mb-1">
              Total Pending
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by worker or ACK reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Worker
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Work Type
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Material
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Qtls
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Bags
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  ACK Ref
                </th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No hamali records found</p>
                    <p className="text-sm mt-1">
                      Add your first hamali record to get started
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {new Date(record.work_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {record.worker_name}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm capitalize">
                      {record.work_type}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm capitalize">
                      {record.material_type}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {record.quantity_qtls || '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {record.bags_count || '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      ₹{record.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {record.ack_reference || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                          record.payment_status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {record.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Edit Hamali Record' : 'Add Hamali Record'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Work Date
                  </label>
                  <input
                    type="date"
                    value={formData.work_date}
                    onChange={(e) =>
                      setFormData({ ...formData, work_date: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Worker Name
                  </label>
                  <input
                    type="text"
                    value={formData.worker_name}
                    onChange={(e) =>
                      setFormData({ ...formData, worker_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Work Type
                  </label>
                  <select
                    value={formData.work_type}
                    onChange={(e) =>
                      setFormData({ ...formData, work_type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="loading">Loading</option>
                    <option value="unloading">Unloading</option>
                    <option value="shifting">Shifting</option>
                    <option value="stacking">Stacking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Material Type
                  </label>
                  <select
                    value={formData.material_type}
                    onChange={(e) =>
                      setFormData({ ...formData, material_type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="paddy">Paddy</option>
                    <option value="rice">Rice</option>
                    <option value="byproduct">By-Product</option>
                    <option value="frk">FRK</option>
                    <option value="gunny">Gunny</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quantity (Qtls)
                  </label>
                  <input
                    type="number"
                    value={formData.quantity_qtls}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_qtls: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Rate per Qtl
                  </label>
                  <input
                    type="number"
                    value={formData.rate_per_qtl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rate_per_qtl: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Bags Count
                  </label>
                  <input
                    type="number"
                    value={formData.bags_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bags_count: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Rate per Bag
                  </label>
                  <input
                    type="number"
                    value={formData.rate_per_bag}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rate_per_bag: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={formData.total_amount}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    ACK Reference
                  </label>
                  <input
                    type="text"
                    value={formData.ack_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, ack_reference: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_status: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {formData.payment_status === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.payment_date || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_date: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all font-medium"
                >
                  <Save size={18} />
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRateSheet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Hamali Work Rate Sheet</h3>
                <p className="text-gray-400 text-sm">Valid from 01/01/2026 to 31/12/2027</p>
              </div>
              <button
                onClick={() => setShowRateSheet(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(HAMALI_RATES).map(([category, rates]) => (
                <div key={category}>
                  <h4 className="text-lg font-bold text-amber-400 mb-3 uppercase">
                    {category === 'brokenRice' ? 'Broken Rice' : category}
                  </h4>
                  <div className="bg-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Work Description</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Rate</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.map((rate, idx) => (
                          <tr key={idx} className="border-b border-white/5">
                            <td className="py-3 px-4 text-gray-300 text-sm">{rate.work}</td>
                            <td className="py-3 px-4 text-right text-white font-medium">₹{rate.rate.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-400 text-sm">{rate.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRateSheet(false)}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
