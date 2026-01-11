import { useState } from 'react';
import { YieldStructure, WorkingCosts } from '../types';
import { formatCurrency, formatQuantity, getWeightFactor } from '../calculations';
import { ShoppingCart, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface PurchaseAnalysisProps {
  yields: YieldStructure;
  byProductRates: {
    brokenRice: number;
    bran: number;
    param: number;
    rejectionRice: number;
    husk: number;
  };
  workingCosts: WorkingCosts;
  use41KgBags: boolean;
  totalPaddyQuantity: number;
}

export default function PurchaseAnalysis({
  yields,
  byProductRates,
  workingCosts,
  use41KgBags,
  totalPaddyQuantity,
}: PurchaseAnalysisProps) {
  const [inputMode, setInputMode] = useState<'paddy' | 'rice'>('paddy');
  const [paddyQuantity, setPaddyQuantity] = useState(1000);
  const [riceQuantity, setRiceQuantity] = useState(290);
  const [riceMultiplier, setRiceMultiplier] = useState(1);
  const [paddyPurchaseRate, setPaddyPurchaseRate] = useState(2500);
  const [riceSaleRate, setRiceSaleRate] = useState(4000);
  const [directRicePurchaseRate, setDirectRicePurchaseRate] = useState(3800);

  const weightFactor = getWeightFactor(use41KgBags);

  const totalRiceRequired = inputMode === 'rice' ? riceQuantity * riceMultiplier : 0;

  const actualPaddy = inputMode === 'paddy'
    ? paddyQuantity * weightFactor
    : (totalRiceRequired / yields.headRice) * 100;

  const effectivePaddyBags = actualPaddy / weightFactor;

  const headRiceQty = (actualPaddy * yields.headRice) / 100;
  const brokenRiceQty = (actualPaddy * yields.brokenRice) / 100;
  const branQty = (actualPaddy * yields.bran) / 100;
  const paramQty = (actualPaddy * yields.param) / 100;
  const rejectionRiceQty = (actualPaddy * yields.rejectionRice) / 100;
  const huskQty = (actualPaddy * yields.husk) / 100;

  const headRiceRevenue = headRiceQty * riceSaleRate;
  const brokenRiceRevenue = brokenRiceQty * byProductRates.brokenRice;
  const branRevenue = branQty * byProductRates.bran;
  const paramRevenue = paramQty * byProductRates.param;
  const rejectionRiceRevenue = rejectionRiceQty * byProductRates.rejectionRice;
  const huskRevenue = huskQty * byProductRates.husk;

  const totalRevenue = headRiceRevenue + brokenRiceRevenue + branRevenue + paramRevenue + rejectionRiceRevenue + huskRevenue;

  const paddyCost = effectivePaddyBags * paddyPurchaseRate;

  const totalWorkingCostsForReference = Object.values(workingCosts).reduce((sum, cost) => sum + cost, 0);
  const totalActualPaddyForReference = totalPaddyQuantity * weightFactor;
  const perQuintalWorkingCost = totalActualPaddyForReference > 0
    ? totalWorkingCostsForReference / totalActualPaddyForReference
    : 0;
  const proportionalWorkingCosts = actualPaddy * perQuintalWorkingCost;

  const totalCosts = paddyCost + proportionalWorkingCosts;

  const netProfit = totalRevenue - totalCosts;
  const profitMargin = (netProfit / totalRevenue) * 100;
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart size={32} />
          <div>
            <h2 className="text-3xl font-bold">Purchase & Sell Analysis</h2>
            <p className="text-green-100">Analyze profitability of buying paddy and selling products</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <span className="text-sm font-semibold text-green-100">Input Mode:</span>
          <button
            onClick={() => setInputMode('paddy')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              inputMode === 'paddy'
                ? 'bg-white text-green-700 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Enter Paddy Quantity
          </button>
          <button
            onClick={() => setInputMode('rice')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              inputMode === 'rice'
                ? 'bg-white text-green-700 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Enter Rice Required (ACKs)
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-6 ${inputMode === 'paddy' ? 'md:grid-cols-4' : 'md:grid-cols-5'}`}>
          {inputMode === 'paddy' ? (
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">
                Paddy Purchase Quantity (Qtl)
              </label>
              <input
                type="number"
                value={paddyQuantity}
                onChange={(e) => setPaddyQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-semibold"
                min="0"
                step="0.01"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                  Rice Required (ACKs/Qtl)
                </label>
                <input
                  type="number"
                  value={riceQuantity}
                  onChange={(e) => setRiceQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-semibold"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                  Multiplier
                </label>
                <input
                  type="number"
                  value={riceMultiplier}
                  onChange={(e) => setRiceMultiplier(parseFloat(e.target.value) || 1)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-semibold"
                  min="1"
                  step="1"
                />
                <div className="mt-2 text-xs text-green-100 bg-white/10 rounded-lg p-2 border border-white/20">
                  <div>Total Rice: <span className="font-bold">{formatQuantity(totalRiceRequired)} Qtls</span></div>
                  <div>Required Paddy: <span className="font-bold">{formatQuantity(effectivePaddyBags)} bags</span></div>
                  <div>Actual Paddy: <span className="font-bold">{formatQuantity(actualPaddy)} Qtls</span></div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-green-100 mb-2">
              Paddy Purchase Rate (₹/Qtl)
            </label>
            <input
              type="number"
              value={paddyPurchaseRate}
              onChange={(e) => setPaddyPurchaseRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-semibold"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-100 mb-2">
              Rice Sale Rate (₹/Qtl)
            </label>
            <input
              type="number"
              value={riceSaleRate}
              onChange={(e) => setRiceSaleRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-semibold"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-100 mb-2">
              Direct Rice Purchase Rate (₹/Qtl)
            </label>
            <input
              type="number"
              value={directRicePurchaseRate}
              onChange={(e) => setDirectRicePurchaseRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-semibold"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            Production Output
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div>
                <div className="font-semibold text-gray-800">Head Rice</div>
                <div className="text-xs text-gray-600">{yields.headRice}% yield</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-green-700">{formatQuantity(headRiceQty)} Qtl</div>
                <div className="text-sm text-gray-600">{formatCurrency(headRiceRevenue)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 px-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <div className="text-sm font-semibold text-gray-700">Broken Rice</div>
                <div className="text-xs text-gray-600">{yields.brokenRice}% yield</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{formatQuantity(brokenRiceQty)} Qtl</div>
                <div className="text-xs text-gray-600">{formatCurrency(brokenRiceRevenue)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 px-4 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <div className="text-sm font-semibold text-gray-700">Bran</div>
                <div className="text-xs text-gray-600">{yields.bran}% yield</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{formatQuantity(branQty)} Qtl</div>
                <div className="text-xs text-gray-600">{formatCurrency(branRevenue)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 px-4 bg-pink-50 rounded-lg border border-pink-200">
              <div>
                <div className="text-sm font-semibold text-gray-700">Param</div>
                <div className="text-xs text-gray-600">{yields.param}% yield</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{formatQuantity(paramQty)} Qtl</div>
                <div className="text-xs text-gray-600">{formatCurrency(paramRevenue)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 px-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <div className="text-sm font-semibold text-gray-700">Rejection Rice</div>
                <div className="text-xs text-gray-600">{yields.rejectionRice}% yield</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{formatQuantity(rejectionRiceQty)} Qtl</div>
                <div className="text-xs text-gray-600">{formatCurrency(rejectionRiceRevenue)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="text-sm font-semibold text-gray-700">Husk</div>
                <div className="text-xs text-gray-600">{yields.husk}% yield</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{formatQuantity(huskQty)} Qtl</div>
                <div className="text-xs text-gray-600">{formatCurrency(huskRevenue)}</div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Revenue</span>
                <span className="text-xl font-bold text-green-700">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-red-600" size={24} />
              Cost Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                <span className="font-semibold text-gray-800">Paddy Purchase Cost</span>
                <span className="text-lg font-bold text-red-700">{formatCurrency(paddyCost)}</span>
              </div>

              <div className="flex justify-between items-center py-2 px-4 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-semibold text-gray-700">Working Costs</span>
                <span className="text-sm font-bold text-gray-800">{formatCurrency(proportionalWorkingCosts)}</span>
              </div>
              <div className="text-xs text-gray-600 px-4 py-1">
                Per quintal: {formatCurrency(perQuintalWorkingCost)}/Qtl × {formatQuantity(actualPaddy)} Qtl
              </div>

              <div className="pt-3 mt-3 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total Costs</span>
                  <span className="text-xl font-bold text-red-700">{formatCurrency(totalCosts)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${isProfitable ? 'from-green-600 to-emerald-600' : 'from-red-600 to-orange-600'} rounded-2xl shadow-2xl p-6 text-white`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              {isProfitable ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Total Revenue</span>
                <span className="font-bold text-xl">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Total Costs</span>
                <span className="font-bold text-xl">{formatCurrency(totalCosts)}</span>
              </div>
              <div className="h-px bg-white/30 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-white/90 font-semibold">Net Profit/Loss</span>
                <span className="font-bold text-3xl">{formatCurrency(netProfit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Profit Margin</span>
                <span className="font-bold text-xl">{profitMargin.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Package size={32} />
          <h2 className="text-3xl font-bold">Profit for 1 ACK (290 Qtls Head Rice)</h2>
        </div>

        {(() => {
          const targetHeadRice = 290;
          const requiredActualPaddy = (targetHeadRice / yields.headRice) * 100;
          const requiredBags = requiredActualPaddy / weightFactor;

          const ackHeadRiceQty = targetHeadRice;
          const ackBrokenRiceQty = (requiredActualPaddy * yields.brokenRice) / 100;
          const ackBranQty = (requiredActualPaddy * yields.bran) / 100;
          const ackParamQty = (requiredActualPaddy * yields.param) / 100;
          const ackRejectionRiceQty = (requiredActualPaddy * yields.rejectionRice) / 100;
          const ackHuskQty = (requiredActualPaddy * yields.husk) / 100;

          const ackHeadRiceRevenue = ackHeadRiceQty * riceSaleRate;
          const ackBrokenRiceRevenue = ackBrokenRiceQty * byProductRates.brokenRice;
          const ackBranRevenue = ackBranQty * byProductRates.bran;
          const ackParamRevenue = ackParamQty * byProductRates.param;
          const ackRejectionRiceRevenue = ackRejectionRiceQty * byProductRates.rejectionRice;
          const ackHuskRevenue = ackHuskQty * byProductRates.husk;

          const ackTotalRevenue = ackHeadRiceRevenue + ackBrokenRiceRevenue + ackBranRevenue + ackParamRevenue + ackRejectionRiceRevenue + ackHuskRevenue;

          const ackPaddyCost = requiredBags * paddyPurchaseRate;
          const ackWorkingCosts = requiredActualPaddy * perQuintalWorkingCost;
          const ackTotalCosts = ackPaddyCost + ackWorkingCosts;

          const ackNetProfit = ackTotalRevenue - ackTotalCosts;
          const ackProfitMargin = (ackNetProfit / ackTotalRevenue) * 100;
          const ackIsProfitable = ackNetProfit >= 0;

          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="text-purple-200 text-sm mb-2">Required Paddy</div>
                  <div className="text-3xl font-bold">{formatQuantity(requiredBags)} Bags</div>
                  <div className="text-purple-200 text-sm mt-1">{formatQuantity(requiredActualPaddy)} Qtls (actual)</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="text-purple-200 text-sm mb-2">Purchase Rate</div>
                  <div className="text-3xl font-bold">{formatCurrency(paddyPurchaseRate)}</div>
                  <div className="text-purple-200 text-sm mt-1">per bag</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="text-purple-200 text-sm mb-2">Rice Sale Rate</div>
                  <div className="text-3xl font-bold">{formatCurrency(riceSaleRate)}</div>
                  <div className="text-purple-200 text-sm mt-1">per quintal</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4 text-purple-200">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 px-4 bg-green-900/30 rounded-lg border border-green-500/30">
                      <span className="font-semibold">Head Rice (290 Qtls)</span>
                      <span className="text-lg font-bold text-green-300">{formatCurrency(ackHeadRiceRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Broken Rice ({formatQuantity(ackBrokenRiceQty)} Qtls)</span>
                      <span className="text-sm font-bold">{formatCurrency(ackBrokenRiceRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Bran ({formatQuantity(ackBranQty)} Qtls)</span>
                      <span className="text-sm font-bold">{formatCurrency(ackBranRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Param ({formatQuantity(ackParamQty)} Qtls)</span>
                      <span className="text-sm font-bold">{formatCurrency(ackParamRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Rejection Rice ({formatQuantity(ackRejectionRiceQty)} Qtls)</span>
                      <span className="text-sm font-bold">{formatCurrency(ackRejectionRiceRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Husk ({formatQuantity(ackHuskQty)} Qtls)</span>
                      <span className="text-sm font-bold">{formatCurrency(ackHuskRevenue)}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t-2 border-purple-300/30">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total Revenue</span>
                        <span className="text-xl font-bold text-green-300">{formatCurrency(ackTotalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4 text-purple-200">Cost Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 px-4 bg-red-900/30 rounded-lg border border-red-500/30">
                      <span className="font-semibold">Paddy Purchase Cost</span>
                      <span className="text-lg font-bold text-red-300">{formatCurrency(ackPaddyCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
                      <span className="text-sm font-semibold">Working Costs</span>
                      <span className="text-sm font-bold">{formatCurrency(ackWorkingCosts)}</span>
                    </div>
                    <div className="text-xs text-purple-200 px-4 py-1">
                      {formatCurrency(perQuintalWorkingCost)}/Qtl × {formatQuantity(requiredActualPaddy)} Qtls
                    </div>
                    <div className="pt-3 mt-3 border-t-2 border-purple-300/30">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total Costs</span>
                        <span className="text-xl font-bold text-red-300">{formatCurrency(ackTotalCosts)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 p-5 rounded-xl border-2 ${ackIsProfitable ? 'bg-green-900/40 border-green-400' : 'bg-red-900/40 border-red-400'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">Net Profit/Loss</span>
                      {ackIsProfitable ? <TrendingUp size={24} className="text-green-300" /> : <TrendingDown size={24} className="text-red-300" />}
                    </div>
                    <div className={`text-4xl font-bold ${ackIsProfitable ? 'text-green-300' : 'text-red-300'}`}>
                      {formatCurrency(ackNetProfit)}
                    </div>
                    <div className="text-sm mt-2 text-white/80">
                      Margin: {ackProfitMargin.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart size={32} />
          <h2 className="text-3xl font-bold">Decision Analysis: Mill Paddy vs Buy Rice Direct</h2>
        </div>

        {(() => {
          const targetHeadRice = 290;
          const requiredActualPaddy = (targetHeadRice / yields.headRice) * 100;
          const requiredBags = requiredActualPaddy / weightFactor;

          const ackBrokenRiceQty = (requiredActualPaddy * yields.brokenRice) / 100;
          const ackBranQty = (requiredActualPaddy * yields.bran) / 100;
          const ackParamQty = (requiredActualPaddy * yields.param) / 100;
          const ackRejectionRiceQty = (requiredActualPaddy * yields.rejectionRice) / 100;
          const ackHuskQty = (requiredActualPaddy * yields.husk) / 100;

          const ackBrokenRiceRevenue = ackBrokenRiceQty * byProductRates.brokenRice;
          const ackBranRevenue = ackBranQty * byProductRates.bran;
          const ackParamRevenue = ackParamQty * byProductRates.param;
          const ackRejectionRiceRevenue = ackRejectionRiceQty * byProductRates.rejectionRice;
          const ackHuskRevenue = ackHuskQty * byProductRates.husk;

          const totalByProductRevenue = ackBrokenRiceRevenue + ackBranRevenue + ackParamRevenue + ackRejectionRiceRevenue + ackHuskRevenue;

          const ackPaddyCost = requiredBags * paddyPurchaseRate;
          const ackWorkingCosts = requiredActualPaddy * perQuintalWorkingCost;
          const totalMillingCost = ackPaddyCost + ackWorkingCosts;

          const netCostAfterByProducts = totalMillingCost - totalByProductRevenue;
          const netCostPerQtlMilling = netCostAfterByProducts / targetHeadRice;

          const directPurchaseCost = targetHeadRice * directRicePurchaseRate;
          const directCostPerQtl = directRicePurchaseRate;

          const costDifference = directPurchaseCost - netCostAfterByProducts;
          const isBuyingDirectCheaper = costDifference < 0;
          const savingsPerQtl = (directCostPerQtl - netCostPerQtlMilling);

          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Package size={28} className="text-orange-200" />
                    <h3 className="text-2xl font-bold">Option A: Buy Paddy & Mill</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-red-900/40 rounded-lg p-4 border border-red-400/40">
                      <div className="text-sm text-red-200 mb-1">Paddy Purchase</div>
                      <div className="text-2xl font-bold">{formatCurrency(ackPaddyCost)}</div>
                      <div className="text-xs text-red-200 mt-1">{formatQuantity(requiredBags)} bags @ {formatCurrency(paddyPurchaseRate)}/bag</div>
                    </div>

                    <div className="bg-orange-900/40 rounded-lg p-4 border border-orange-400/40">
                      <div className="text-sm text-orange-200 mb-1">Working Costs</div>
                      <div className="text-2xl font-bold">{formatCurrency(ackWorkingCosts)}</div>
                      <div className="text-xs text-orange-200 mt-1">{formatQuantity(requiredActualPaddy)} Qtls @ {formatCurrency(perQuintalWorkingCost)}/Qtl</div>
                    </div>

                    <div className="bg-green-900/40 rounded-lg p-4 border border-green-400/40">
                      <div className="text-sm text-green-200 mb-1">By-Product Revenue</div>
                      <div className="text-2xl font-bold text-green-300">- {formatCurrency(totalByProductRevenue)}</div>
                      <div className="text-xs text-green-200 mt-1">From broken rice, bran, param, husk, etc.</div>
                    </div>

                    <div className="h-px bg-white/40 my-2"></div>

                    <div className="bg-white/20 rounded-xl p-5 border-2 border-white/50">
                      <div className="text-sm text-orange-100 mb-2">Net Cost for 290 Qtls Rice</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(netCostAfterByProducts)}</div>
                      <div className="text-sm text-orange-100 mt-2">Cost per Quintal: {formatCurrency(netCostPerQtlMilling)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign size={28} className="text-orange-200" />
                    <h3 className="text-2xl font-bold">Option B: Buy Rice Direct</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-red-900/40 rounded-lg p-4 border border-red-400/40">
                      <div className="text-sm text-red-200 mb-1">Direct Purchase</div>
                      <div className="text-2xl font-bold">{formatCurrency(directPurchaseCost)}</div>
                      <div className="text-xs text-red-200 mt-1">290 Qtls @ {formatCurrency(directRicePurchaseRate)}/Qtl</div>
                    </div>

                    <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
                      <div className="text-sm text-blue-200 mb-1">Working Costs</div>
                      <div className="text-2xl font-bold text-blue-300">₹0</div>
                      <div className="text-xs text-blue-200 mt-1">No milling required</div>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-500/30">
                      <div className="text-sm text-gray-300 mb-1">By-Product Revenue</div>
                      <div className="text-2xl font-bold text-gray-300">₹0</div>
                      <div className="text-xs text-gray-300 mt-1">No by-products generated</div>
                    </div>

                    <div className="h-px bg-white/40 my-2"></div>

                    <div className="bg-white/20 rounded-xl p-5 border-2 border-white/50">
                      <div className="text-sm text-orange-100 mb-2">Total Cost for 290 Qtls Rice</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(directPurchaseCost)}</div>
                      <div className="text-sm text-orange-100 mt-2">Cost per Quintal: {formatCurrency(directCostPerQtl)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-2xl border-4 ${isBuyingDirectCheaper ? 'bg-red-900/50 border-red-400' : 'bg-green-900/50 border-green-400'}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-3">
                    {isBuyingDirectCheaper ? '🚨 MILLING IS MORE EXPENSIVE' : '✓ MILLING IS CHEAPER'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <div className="text-sm text-white/80 mb-2">Cost Difference</div>
                      <div className={`text-4xl font-bold ${isBuyingDirectCheaper ? 'text-red-300' : 'text-green-300'}`}>
                        {formatCurrency(Math.abs(costDifference))}
                      </div>
                      <div className="text-xs text-white/70 mt-2">for 290 Qtls</div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <div className="text-sm text-white/80 mb-2">Per Quintal Difference</div>
                      <div className={`text-4xl font-bold ${savingsPerQtl < 0 ? 'text-red-300' : 'text-green-300'}`}>
                        {formatCurrency(Math.abs(savingsPerQtl))}
                      </div>
                      <div className="text-xs text-white/70 mt-2">per Qtl</div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <div className="text-sm text-white/80 mb-2">Better Option</div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {isBuyingDirectCheaper ? 'BUY DIRECT' : 'MILL PADDY'}
                      </div>
                      <div className="text-xs text-white/70 mt-2">
                        {isBuyingDirectCheaper ? 'Buy rice from market' : 'Purchase paddy & mill'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/15 rounded-xl p-5 border border-white/30">
                    <div className="text-lg font-semibold text-white mb-2">Recommendation</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {isBuyingDirectCheaper
                        ? `Buying rice directly from the market saves you ${formatCurrency(Math.abs(costDifference))} compared to milling paddy. Even without by-product revenue from milling, direct purchase is more cost-effective at the current market rates.`
                        : `Milling paddy yourself saves you ${formatCurrency(Math.abs(costDifference))} compared to buying rice directly. The combination of lower paddy costs and by-product revenue (${formatCurrency(totalByProductRevenue)}) makes milling the better option.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm border border-blue-700 rounded-2xl p-6">
        <h3 className="font-bold text-blue-300 mb-3 text-lg">Analysis Notes</h3>
        <ul className="text-sm text-blue-100 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            This analysis uses the same yield percentages and by-product rates from the main calculator
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Bag weight setting: {use41KgBags ? '41kg per bag (2.5% excess)' : '40kg per bag (exact weight)'}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Working costs calculated per quintal based on reference batch ({formatQuantity(totalPaddyQuantity)} Qtl)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Compare with CMR operations to determine the better profit opportunity
          </li>
        </ul>
      </div>
    </div>
  );
}
