import { RiceType, WorkingCosts } from '../types';
import { DollarSign } from 'lucide-react';

interface InputFormProps {
  paddyQuantity: number;
  riceType: RiceType;
  ricePurchaseRate: number;
  workingCosts: WorkingCosts;
  use41KgBags: boolean;
  onPaddyQuantityChange: (value: number) => void;
  onRiceTypeChange: (value: RiceType) => void;
  onRicePurchaseRateChange: (value: number) => void;
  onWorkingCostsChange: (costs: WorkingCosts) => void;
  onBagWeightToggle: (value: boolean) => void;
}

export default function InputForm({
  paddyQuantity,
  riceType,
  ricePurchaseRate,
  workingCosts,
  use41KgBags,
  onPaddyQuantityChange,
  onRiceTypeChange,
  onRicePurchaseRateChange,
  onWorkingCostsChange,
  onBagWeightToggle,
}: InputFormProps) {
  const handleCostChange = (field: keyof WorkingCosts, value: string) => {
    const numValue = parseFloat(value) || 0;
    onWorkingCostsChange({
      ...workingCosts,
      [field]: numValue,
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 space-y-6 border border-gray-200">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent border-b-2 border-blue-200 pb-3 flex items-center gap-2">
        <DollarSign className="text-blue-600" size={28} />
        Basic Inputs
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Paddy Quantity (Quintals)
          </label>
          <input
            type="number"
            value={paddyQuantity}
            onChange={(e) => onPaddyQuantityChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50 font-semibold text-gray-800"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rice Type
          </label>
          <select
            value={riceType}
            onChange={(e) => onRiceTypeChange(e.target.value as RiceType)}
            className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50/50 font-semibold text-gray-800"
          >
            <option value="raw">Raw Rice (67% out-turn)</option>
            <option value="boiled">Boiled Rice (68% out-turn)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rice Purchase Rate (₹/Quintal)
          </label>
          <input
            type="number"
            value={ricePurchaseRate}
            onChange={(e) => onRicePurchaseRateChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50/50 font-semibold text-gray-800"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="block text-sm font-semibold text-gray-800 mb-1">
              Bag Weight Configuration
            </span>
            <span className="block text-xs text-gray-600">
              {use41KgBags ? 'Using 41kg per bag (2.5% excess)' : 'Using 40kg per bag (exact weight)'}
            </span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={use41KgBags}
              onChange={(e) => onBagWeightToggle(e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${use41KgBags ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
            <div className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${use41KgBags ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
          Working Costs (₹)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Electricity
            </label>
            <input
              type="number"
              value={workingCosts.electricity}
              onChange={(e) => handleCostChange('electricity', e.target.value)}
              className="w-full px-3 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50/30"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labour
            </label>
            <input
              type="number"
              value={workingCosts.labour}
              onChange={(e) => handleCostChange('labour', e.target.value)}
              className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-orange-50/30"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salaries
            </label>
            <input
              type="number"
              value={workingCosts.salaries}
              onChange={(e) => handleCostChange('salaries', e.target.value)}
              className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50/30"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hamali
            </label>
            <input
              type="number"
              value={workingCosts.hamali}
              onChange={(e) => handleCostChange('hamali', e.target.value)}
              className="w-full px-3 py-2 border-2 border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50/30"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spares
            </label>
            <input
              type="number"
              value={workingCosts.spares}
              onChange={(e) => handleCostChange('spares', e.target.value)}
              className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50/30"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FCI Expenses
            </label>
            <input
              type="number"
              value={workingCosts.fciExpenses}
              onChange={(e) => handleCostChange('fciExpenses', e.target.value)}
              className="w-full px-3 py-2 border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-teal-50/30"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Others
            </label>
            <input
              type="number"
              value={workingCosts.others}
              onChange={(e) => handleCostChange('others', e.target.value)}
              className="w-full px-3 py-2 border-2 border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-cyan-50/30"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
