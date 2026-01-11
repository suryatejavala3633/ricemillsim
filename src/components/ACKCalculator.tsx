import { useState } from 'react';
import { RiceType, YieldStructure, WorkingCosts } from '../types';
import { calculateACKRequirements, formatCurrency, formatQuantity, getOutTurnRate, getWeightFactor } from '../calculations';
import { Package, TrendingDown, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface ACKCalculatorProps {
  riceType: RiceType;
  yields: YieldStructure;
  byProductRates: {
    brokenRice: number;
    bran: number;
    param: number;
    rejectionRice: number;
    husk: number;
  };
  ricePurchaseRate: number;
  workingCosts: WorkingCosts;
  totalPaddyQuantity: number;
  use41KgBags: boolean;
  onRiceTypeChange: (value: RiceType) => void;
  onRicePurchaseRateChange: (value: number) => void;
}

export default function ACKCalculator({
  riceType,
  yields,
  byProductRates,
  ricePurchaseRate,
  workingCosts,
  totalPaddyQuantity,
  use41KgBags,
  onRiceTypeChange,
  onRicePurchaseRateChange,
}: ACKCalculatorProps) {
  const [targetRice, setTargetRice] = useState(290);

  const results = calculateACKRequirements(
    targetRice,
    riceType,
    yields,
    byProductRates,
    ricePurchaseRate,
    workingCosts,
    totalPaddyQuantity,
    use41KgBags
  );

  const weightFactor = getWeightFactor(use41KgBags);
  const totalActualPaddy = totalPaddyQuantity * weightFactor;
  const isProfitable = results.netProfit >= 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Package size={32} className="animate-pulse" />
          <div>
            <h2 className="text-3xl font-bold">ACK Calculator</h2>
            <p className="text-purple-100 text-sm">Calculate paddy required and net profit for CMR delivery</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-purple-100 mb-2">
              Target CMR Rice (Quintals)
            </label>
            <input
              type="number"
              value={targetRice}
              onChange={(e) => setTargetRice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-purple-200 focus:ring-2 focus:ring-white focus:border-transparent text-lg font-semibold"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-purple-100 mt-2">Standard: 1 ACK = 290 Qtls</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-100 mb-2">
              Rice Type
            </label>
            <select
              value={riceType}
              onChange={(e) => onRiceTypeChange(e.target.value as RiceType)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent text-lg font-semibold"
            >
              <option value="raw" className="text-gray-900">Raw Rice (67% out-turn)</option>
              <option value="boiled" className="text-gray-900">Boiled Rice (68% out-turn)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-100 mb-2">
              Rice Purchase Rate (₹/Quintal)
            </label>
            <input
              type="number"
              value={ricePurchaseRate}
              onChange={(e) => onRicePurchaseRateChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-purple-200 focus:ring-2 focus:ring-white focus:border-transparent text-lg font-semibold"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-purple-100 mt-2">For shortfall recovery</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm font-semibold text-blue-100 mb-2">Target CMR Rice</div>
          <div className="text-3xl font-bold mb-1">{formatQuantity(results.targetRice)} Qtl</div>
          <div className="text-xs text-blue-100">To be delivered</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm font-semibold text-orange-100 mb-2">Required Standard Paddy</div>
          <div className="text-3xl font-bold mb-1">{formatQuantity(results.requiredStandardPaddy)} Qtl</div>
          <div className="text-xs text-orange-100">At {(getOutTurnRate(riceType) * 100).toFixed(0)}% out-turn</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm font-semibold text-green-100 mb-2">Required Actual Paddy</div>
          <div className="text-3xl font-bold mb-1">{formatQuantity(results.requiredActualPaddy)} Qtl</div>
          <div className="text-xs text-green-100">Including 2.5% excess</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="text-blue-600" size={24} />
            Working Costs per ACK
          </h3>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
            <div className="text-sm text-blue-800 mb-2">
              <span className="font-semibold">Proportional Calculation:</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Total Paddy: {formatQuantity(totalPaddyQuantity)} Qtl</div>
              <div>ACK Requires: {formatQuantity(results.requiredStandardPaddy)} Qtl</div>
              <div>Proportion: {((results.requiredStandardPaddy / totalPaddyQuantity) * 100).toFixed(2)}%</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm text-gray-700">Electricity</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.electricity * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-sm text-gray-700">Labour</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.labour * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-sm text-gray-700">Salaries</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.salaries * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-pink-50 rounded-lg border border-pink-200">
              <span className="text-sm text-gray-700">Hamali</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.hamali * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm text-gray-700">Spares</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.spares * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-teal-50 rounded-lg border border-teal-200">
              <span className="text-sm text-gray-700">FCI Expenses</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.fciExpenses * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <span className="text-sm text-gray-700">Others</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency((workingCosts.others * results.requiredActualPaddy) / totalActualPaddy)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Working Costs per ACK</span>
              <span className="text-xl font-bold text-orange-700">{formatCurrency(results.totalWorkingCosts)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={24} />
            Rice Yield Analysis
          </h3>
          <div className="space-y-3">
            <div className="bg-green-100 p-3 rounded-lg border-2 border-green-300">
              <div className="text-xs text-green-700 font-medium">Actual Head Rice Produced</div>
              <div className="text-2xl font-bold text-green-800">{formatQuantity(results.actualHeadRice)} Qtl</div>
            </div>
            {results.riceShortfall > 0 && (
              <div className="bg-red-100 p-3 rounded-lg border-2 border-red-300">
                <div className="text-xs text-red-700 font-medium">Rice Shortfall (Must Purchase)</div>
                <div className="text-2xl font-bold text-red-800">{formatQuantity(results.riceShortfall)} Qtl</div>
                <div className="text-sm font-semibold text-red-700 mt-1">
                  Cost: {formatCurrency(results.riceShortfallCost)}
                </div>
              </div>
            )}
            {results.riceShortfall === 0 && (
              <div className="bg-green-100 p-3 rounded-lg border-2 border-green-300">
                <div className="text-sm font-semibold text-green-800">No shortfall - Sufficient rice yield!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingDown className="text-purple-600" size={28} />
          By-Products Generated
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
                <th className="px-4 py-3 text-left text-sm font-bold text-purple-900">
                  By-Product
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-purple-900">
                  Yield %
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-purple-900">
                  Quantity (Qtl)
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-purple-900">
                  Rate (₹/Qtl)
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-purple-900">
                  Value (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {results.byProducts.map((product, index) => (
                <tr
                  key={product.name}
                  className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 font-medium">
                    {product.yieldPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800 font-semibold">
                    {formatQuantity(product.quantity)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-purple-700 font-medium">
                    ₹{product.rate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                    {formatCurrency(product.value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <td
                  colSpan={4}
                  className="px-4 py-4 text-sm font-bold text-right"
                >
                  Total By-Product Revenue
                </td>
                <td className="px-4 py-4 text-lg text-right font-bold">
                  {formatCurrency(results.totalByProductRevenue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div
        className={`rounded-2xl shadow-2xl p-8 ${
          isProfitable
            ? 'bg-gradient-to-br from-green-600 to-emerald-600'
            : 'bg-gradient-to-br from-red-600 to-pink-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-semibold mb-1">
              Net Profit per ACK
            </h2>
            <div className="text-white text-5xl font-bold">
              {formatCurrency(results.netProfit)}
            </div>
            <div className="text-white text-sm mt-4 opacity-90 space-y-1">
              <div className="font-semibold">Calculation:</div>
              <div>+ By-Product Revenue: {formatCurrency(results.totalByProductRevenue)}</div>
              <div>- Rice Shortfall Cost: {formatCurrency(results.riceShortfallCost)}</div>
              <div>- Working Costs: {formatCurrency(results.totalWorkingCosts)}</div>
            </div>
          </div>
          <div className="text-white">
            {isProfitable ? (
              <TrendingUp size={80} strokeWidth={2.5} className="animate-pulse" />
            ) : (
              <TrendingDown size={80} strokeWidth={2.5} className="animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6">
        <h3 className="font-bold text-cyan-900 mb-3 text-lg">Summary for {formatQuantity(targetRice)} Qtl ACK</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-cyan-800">
          <div>
            <span className="font-semibold">Paddy Requirements:</span>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Standard: {formatQuantity(results.requiredStandardPaddy)} Qtl</li>
              <li>• Actual consumed: {formatQuantity(results.requiredActualPaddy)} Qtl</li>
              <li>• Head rice produced: {formatQuantity(results.actualHeadRice)} Qtl</li>
              {results.riceShortfall > 0 && (
                <li className="text-red-700 font-semibold">• Shortfall to buy: {formatQuantity(results.riceShortfall)} Qtl</li>
              )}
            </ul>
          </div>
          <div>
            <span className="font-semibold">Financial Summary:</span>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• By-product value: {formatCurrency(results.totalByProductRevenue)}</li>
              <li>• Working costs: {formatCurrency(results.totalWorkingCosts)}</li>
              {results.riceShortfall > 0 && (
                <li className="text-red-700">• Shortfall cost: {formatCurrency(results.riceShortfallCost)}</li>
              )}
              <li className={`font-bold ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                • Net Profit: {formatCurrency(results.netProfit)}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
