import { CalculationResults, WorkingCosts, RiceType } from '../types';
import { formatCurrency, formatQuantity, getOutTurnRate } from '../calculations';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface FinancialSummaryProps {
  results: CalculationResults;
  workingCosts: WorkingCosts;
  riceType: RiceType;
}

export default function FinancialSummary({
  results,
  workingCosts,
  riceType,
}: FinancialSummaryProps) {
  const isProfitable = results.netBalance >= 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent border-b-2 border-blue-200 pb-3 flex items-center gap-2">
          <DollarSign className="text-blue-600" size={28} />
          Weight & Rice Calculations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl border-2 border-gray-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">Standard Paddy</div>
            <div className="text-xl font-bold text-gray-800">
              {formatQuantity(results.standardPaddy)} Qtl
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 rounded-xl border-2 border-slate-300">
            <div className="text-sm text-slate-600 mb-1 font-medium">
              Actual Paddy (2.5% excess)
            </div>
            <div className="text-xl font-bold text-slate-800">
              {formatQuantity(results.actualPaddy)} Qtl
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-300">
            <div className="text-sm text-blue-700 mb-1 font-medium">
              Required Rice ({(getOutTurnRate(riceType) * 100).toFixed(0)}% out-turn)
            </div>
            <div className="text-xl font-bold text-blue-800">
              {formatQuantity(results.requiredRice)} Qtl
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-xl border-2 border-green-300">
            <div className="text-sm text-green-700 mb-1 font-medium">Actual Head Rice</div>
            <div className="text-xl font-bold text-green-800">
              {formatQuantity(results.actualHeadRice)} Qtl
            </div>
          </div>
        </div>

        {results.riceShortfall > 0 && (
          <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1 animate-pulse" size={24} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-700 mb-1">
                Rice Shortfall (Must Purchase)
              </div>
              <div className="text-2xl font-bold text-red-800">
                {formatQuantity(results.riceShortfall)} Qtl
              </div>
              <div className="text-lg font-semibold text-red-700 mt-2">
                Cost: {formatCurrency(results.riceShortfallCost)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent border-b-2 border-orange-200 pb-3">
          Cost Breakdown
        </h2>

        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-yellow-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">Electricity</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.electricity)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-orange-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">Labour</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.labour)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-red-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">Salaries</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.salaries)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-pink-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">Hamali</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.hamali)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-indigo-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">Spares</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.spares)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-teal-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">FCI Expenses</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.fciExpenses)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-cyan-50 px-2 rounded transition-colors">
            <span className="text-gray-700 font-medium">Others</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(workingCosts.others)}
            </span>
          </div>
          <div className="flex justify-between py-3 bg-gradient-to-r from-orange-100 to-red-100 px-3 rounded-xl mt-2 border-2 border-orange-300">
            <span className="font-bold text-gray-800">
              Total Working Costs
            </span>
            <span className="font-bold text-orange-800">
              {formatCurrency(results.totalWorkingCosts)}
            </span>
          </div>
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
              Net Financial Balance
            </h2>
            <div className="text-white text-4xl font-bold">
              {formatCurrency(results.netBalance)}
            </div>
            <div className="text-white text-sm mt-3 opacity-90 space-y-1">
              <div>By-Product Revenue: {formatCurrency(results.totalByProductRevenue)}</div>
              <div>Rice Shortfall Cost: {formatCurrency(results.riceShortfallCost)}</div>
              <div>Working Costs: {formatCurrency(results.totalWorkingCosts)}</div>
            </div>
          </div>
          <div className="text-white">
            {isProfitable ? (
              <TrendingUp size={64} strokeWidth={2.5} className="animate-pulse" />
            ) : (
              <TrendingDown size={64} strokeWidth={2.5} className="animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
