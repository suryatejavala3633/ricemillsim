import { ByProduct } from '../types';
import { formatCurrency, formatQuantity } from '../calculations';
import { TrendingUp } from 'lucide-react';

interface ByProductTableProps {
  byProducts: ByProduct[];
  totalRevenue: number;
  byProductRates: {
    brokenRice: number;
    bran: number;
    param: number;
    rejectionRice: number;
    husk: number;
  };
  onRateChange: (
    product: 'brokenRice' | 'bran' | 'param' | 'rejectionRice' | 'husk',
    rate: number
  ) => void;
}

export default function ByProductTable({
  byProducts,
  totalRevenue,
  byProductRates,
  onRateChange,
}: ByProductTableProps) {
  const rateMapping: Record<
    string,
    'brokenRice' | 'bran' | 'param' | 'rejectionRice' | 'husk'
  > = {
    'Broken Rice': 'brokenRice',
    'Bran': 'bran',
    'Param (Short Broken)': 'param',
    'Rejection Rice': 'rejectionRice',
    'Husk': 'husk',
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent border-b-2 border-green-200 pb-3 flex items-center gap-2">
        <TrendingUp className="text-green-600" size={28} />
        By-Product Revenue
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">
                By-Product
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-green-900">
                Yield %
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-green-900">
                Quantity (Qtl)
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-green-900">
                Rate (₹/Qtl)
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-green-900">
                Value (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {byProducts.map((product, index) => {
              const rateKey = rateMapping[product.name];
              return (
                <tr key={product.name} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-50' : ''
                }`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {product.yieldPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 font-semibold">
                    {formatQuantity(product.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={product.rate}
                      onChange={(e) =>
                        onRateChange(rateKey, parseFloat(e.target.value) || 0)
                      }
                      className="w-28 px-2 py-1 text-sm text-right border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50/50 font-semibold"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                    {formatCurrency(product.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-green-600 to-emerald-600">
              <td
                colSpan={4}
                className="px-4 py-3 text-sm font-bold text-white text-right"
              >
                Total By-Product Revenue
              </td>
              <td className="px-4 py-3 text-lg text-right font-bold text-white">
                {formatCurrency(totalRevenue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
