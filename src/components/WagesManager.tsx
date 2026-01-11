import { useState, useEffect } from 'react';
import { DollarSign, Plus, Save, X, Search, Edit, Trash2, AlertCircle, Calendar } from 'lucide-react';
import { SupervisorWagesService } from '../services/SupervisorWagesService';

interface WageRecord {
  id: string;
  employee_name: string;
  role: string;
  payment_date: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  ack_bonus: number;
  acks_completed: number;
  overtime_hours: number;
  overtime_amount: number;
  deductions: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  notes: string;
}

const wagesService = new SupervisorWagesService();

export default function WagesManager() {
  const [records, setRecords] = useState<WageRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_name: '',
    role: 'operator',
    payment_date: new Date().toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    base_salary: 0,
    ack_bonus: 0,
    acks_completed: 0,
    overtime_hours: 0,
    overtime_amount: 0,
    deductions: 0,
    total_amount: 0,
    payment_method: 'cash',
    payment_status: 'pending',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [
    formData.base_salary,
    formData.ack_bonus,
    formData.acks_completed,
    formData.overtime_amount,
    formData.deductions,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await wagesService.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Error loading wage records:', error);
      alert('Failed to load wage records');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const bonusTotal = formData.ack_bonus * formData.acks_completed;
    const total =
      formData.base_salary +
      bonusTotal +
      formData.overtime_amount -
      formData.deductions;
    setFormData((prev) => ({ ...prev, total_amount: Math.max(0, total) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await wagesService.update(editingId, formData);
      } else {
        await wagesService.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving wage record:', error);
      alert('Failed to save wage record');
    }
  };

  const handleEdit = (record: WageRecord) => {
    setFormData({
      employee_name: record.employee_name,
      role: record.role,
      payment_date: record.payment_date,
      period_start: record.period_start || '',
      period_end: record.period_end || '',
      base_salary: record.base_salary,
      ack_bonus: record.ack_bonus,
      acks_completed: record.acks_completed,
      overtime_hours: record.overtime_hours,
      overtime_amount: record.overtime_amount,
      deductions: record.deductions,
      total_amount: record.total_amount,
      payment_method: record.payment_method,
      payment_status: record.payment_status,
      notes: record.notes,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await wagesService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      role: 'operator',
      payment_date: new Date().toISOString().split('T')[0],
      period_start: '',
      period_end: '',
      base_salary: 0,
      ack_bonus: 0,
      acks_completed: 0,
      overtime_hours: 0,
      overtime_amount: 0,
      deductions: 0,
      total_amount: 0,
      payment_method: 'cash',
      payment_status: 'pending',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.employee_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || record.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' || record.payment_status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalWages = filteredRecords.reduce((sum, r) => sum + r.total_amount, 0);
  const totalPaid = filteredRecords.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.total_amount, 0);
  const totalPending = filteredRecords.filter(r => r.payment_status === 'pending').reduce((sum, r) => sum + r.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <DollarSign size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Wages & Salaries</h2>
              <p className="text-gray-400 text-sm">
                Manage supervisor and operator wages with bonuses
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} />
            Add Wage Record
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-emerald-400 text-xs font-medium uppercase tracking-wide mb-1">
              Total Wages
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{totalWages.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">
              Total Paid
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
            <div className="text-amber-400 text-xs font-medium uppercase tracking-wide mb-1">
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
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Roles</option>
            <option value="supervisor">Supervisor</option>
            <option value="operator">Operator</option>
            <option value="helper">Helper</option>
            <option value="technician">Technician</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
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
                  Employee
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Period
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Base
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  ACKs
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Bonus
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  OT
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Total
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
                    <p>No wage records found</p>
                    <p className="text-sm mt-1">
                      Add your first wage record to get started
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      {record.employee_name}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm capitalize">
                      {record.role}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {record.period_start && record.period_end
                        ? `${new Date(record.period_start).toLocaleDateString('en-IN')} - ${new Date(record.period_end).toLocaleDateString('en-IN')}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      ₹{record.base_salary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {record.acks_completed}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      ₹{(record.ack_bonus * record.acks_completed).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-400">
                      ₹{record.overtime_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      ₹{record.total_amount.toLocaleString('en-IN')}
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
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Edit Wage Record' : 'Add Wage Record'}
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
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.employee_name}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="operator">Operator</option>
                    <option value="helper">Helper</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) =>
                      setFormData({ ...formData, period_start: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) =>
                      setFormData({ ...formData, period_end: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    value={formData.base_salary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_salary: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    ACK Bonus (per ACK)
                  </label>
                  <input
                    type="number"
                    value={formData.ack_bonus}
                    onChange={(e) =>
                      setFormData({ ...formData, ack_bonus: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    ACKs Completed
                  </label>
                  <input
                    type="number"
                    value={formData.acks_completed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acks_completed: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    value={formData.overtime_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overtime_hours: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Overtime Amount
                  </label>
                  <input
                    type="number"
                    value={formData.overtime_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overtime_amount: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Deductions
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deductions: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
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
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all font-medium"
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
    </div>
  );
}
