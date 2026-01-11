import { useState, useEffect } from 'react';
import { Truck, Plus, Save, X, Search, DollarSign, Edit, Trash2, AlertCircle } from 'lucide-react';
import { LorryFreightService } from '../services/LorryFreightService';
import { TransporterService } from '../services/TransporterService';

interface LorryFreight {
  id: string;
  ack_number: string;
  delivery_date: string;
  vehicle_number: string;
  transporter_id?: string;
  transporter_name: string;
  quantity_qtls: number;
  freight_rate: number;
  total_freight: number;
  advance_paid: number;
  balance_due: number;
  payment_status: 'pending' | 'partial' | 'paid';
  destination: string;
  notes: string;
}

interface Transporter {
  id: string;
  name: string;
  contact_number: string;
  address: string;
  pan_number: string;
  notes: string;
  is_active: boolean;
}

const lorryFreightService = new LorryFreightService();
const transporterService = new TransporterService();

export default function LorryFreightManager() {
  const [freightRecords, setFreightRecords] = useState<LorryFreight[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTransporterForm, setShowTransporterForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    ack_number: '',
    delivery_date: new Date().toISOString().split('T')[0],
    vehicle_number: '',
    transporter_id: '',
    transporter_name: '',
    quantity_qtls: 290,
    freight_rate: 0,
    total_freight: 0,
    advance_paid: 0,
    balance_due: 0,
    payment_status: 'pending' as 'pending' | 'partial' | 'paid',
    destination: 'FCI',
    notes: '',
  });

  const [transporterFormData, setTransporterFormData] = useState({
    name: '',
    contact_number: '',
    address: '',
    pan_number: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.quantity_qtls, formData.freight_rate, formData.advance_paid]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [freight, trans] = await Promise.all([
        lorryFreightService.getAll(),
        transporterService.getAll(),
      ]);
      setFreightRecords(freight);
      setTransporters(trans.filter((t: Transporter) => t.is_active));
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const total = formData.quantity_qtls * formData.freight_rate;
    const balance = total - formData.advance_paid;
    setFormData(prev => ({
      ...prev,
      total_freight: total,
      balance_due: balance,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedTransporter = transporters.find(t => t.id === formData.transporter_id);
      const dataToSave = {
        ...formData,
        transporter_name: selectedTransporter?.name || formData.transporter_name,
        payment_status: formData.balance_due <= 0 ? 'paid' : (formData.advance_paid > 0 ? 'partial' : 'pending'),
      };

      if (editingId) {
        await lorryFreightService.update(editingId, dataToSave);
      } else {
        await lorryFreightService.create(dataToSave);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving freight record:', error);
      alert('Failed to save freight record');
    }
  };

  const handleTransporterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transporterService.create(transporterFormData);
      await loadData();
      setShowTransporterForm(false);
      setTransporterFormData({
        name: '',
        contact_number: '',
        address: '',
        pan_number: '',
        notes: '',
        is_active: true,
      });
    } catch (error) {
      console.error('Error saving transporter:', error);
      alert('Failed to save transporter');
    }
  };

  const handleEdit = (record: LorryFreight) => {
    setFormData({
      ack_number: record.ack_number,
      delivery_date: record.delivery_date,
      vehicle_number: record.vehicle_number,
      transporter_id: record.transporter_id || '',
      transporter_name: record.transporter_name,
      quantity_qtls: record.quantity_qtls,
      freight_rate: record.freight_rate,
      total_freight: record.total_freight,
      advance_paid: record.advance_paid,
      balance_due: record.balance_due,
      payment_status: record.payment_status,
      destination: record.destination,
      notes: record.notes,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await lorryFreightService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const resetForm = () => {
    setFormData({
      ack_number: '',
      delivery_date: new Date().toISOString().split('T')[0],
      vehicle_number: '',
      transporter_id: '',
      transporter_name: '',
      quantity_qtls: 290,
      freight_rate: 0,
      total_freight: 0,
      advance_paid: 0,
      balance_due: 0,
      payment_status: 'pending',
      destination: 'FCI',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredRecords = freightRecords.filter(record => {
    const matchesSearch =
      record.ack_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.transporter_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalFreight = filteredRecords.reduce((sum, r) => sum + r.total_freight, 0);
  const totalPaid = filteredRecords.reduce((sum, r) => sum + r.advance_paid, 0);
  const totalDue = filteredRecords.reduce((sum, r) => sum + r.balance_due, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Truck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Lorry Freight Management</h2>
              <p className="text-gray-400 text-sm">Track ACK deliveries and transporter payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransporterForm(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl transition-all text-sm"
            >
              Add Transporter
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
              Add Freight Record
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">Total Freight</div>
            <div className="text-2xl font-bold text-white">₹{totalFreight.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-emerald-400 text-xs font-medium uppercase tracking-wide mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-white">₹{totalPaid.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
            <div className="text-amber-400 text-xs font-medium uppercase tracking-wide mb-1">Total Due</div>
            <div className="text-2xl font-bold text-white">₹{totalDue.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
            <div className="text-purple-400 text-xs font-medium uppercase tracking-wide mb-1">Total ACKs</div>
            <div className="text-2xl font-bold text-white">{filteredRecords.length}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ACK, Vehicle, or Transporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ACK Number</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Vehicle</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Transporter</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Qty (Qtls)</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Rate</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Total</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Advance</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Balance</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
                    <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No freight records found</p>
                    <p className="text-sm mt-1">Add your first freight record to get started</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{record.ack_number}</td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {new Date(record.delivery_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{record.vehicle_number}</td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{record.transporter_name}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{record.quantity_qtls}</td>
                    <td className="py-3 px-4 text-right text-gray-300">₹{record.freight_rate}</td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      ₹{record.total_freight.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      ₹{record.advance_paid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400">
                      ₹{record.balance_due.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                        record.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        record.payment_status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
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
                {editingId ? 'Edit Freight Record' : 'Add Freight Record'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">ACK Number</label>
                  <input
                    type="text"
                    value={formData.ack_number}
                    onChange={(e) => setFormData({ ...formData, ack_number: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Delivery Date</label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Transporter</label>
                  <select
                    value={formData.transporter_id}
                    onChange={(e) => setFormData({ ...formData, transporter_id: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Select Transporter</option>
                    {transporters.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Quantity (Qtls)</label>
                  <input
                    type="number"
                    value={formData.quantity_qtls}
                    onChange={(e) => setFormData({ ...formData, quantity_qtls: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Freight Rate (per Qtl)</label>
                  <input
                    type="number"
                    value={formData.freight_rate}
                    onChange={(e) => setFormData({ ...formData, freight_rate: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Total Freight</label>
                  <input
                    type="number"
                    value={formData.total_freight}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Advance Paid</label>
                  <input
                    type="number"
                    value={formData.advance_paid}
                    onChange={(e) => setFormData({ ...formData, advance_paid: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Balance Due</label>
                  <input
                    type="number"
                    value={formData.balance_due}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all font-medium"
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

      {showTransporterForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Transporter</h3>
              <button onClick={() => setShowTransporterForm(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleTransporterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={transporterFormData.name}
                  onChange={(e) => setTransporterFormData({ ...transporterFormData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Contact Number</label>
                <input
                  type="text"
                  value={transporterFormData.contact_number}
                  onChange={(e) => setTransporterFormData({ ...transporterFormData, contact_number: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                <textarea
                  value={transporterFormData.address}
                  onChange={(e) => setTransporterFormData({ ...transporterFormData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">PAN Number</label>
                <input
                  type="text"
                  value={transporterFormData.pan_number}
                  onChange={(e) => setTransporterFormData({ ...transporterFormData, pan_number: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all font-medium"
                >
                  <Save size={18} />
                  Save Transporter
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransporterForm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
