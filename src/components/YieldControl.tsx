import { YieldStructure } from '../types';
import { AlertTriangle, Sliders } from 'lucide-react';

interface YieldControlProps {
  yields: YieldStructure;
  yieldTotal: number;
  onYieldsChange: (yields: YieldStructure) => void;
}

export default function YieldControl({
  yields,
  yieldTotal,
  onYieldsChange,
}: YieldControlProps) {
  const handleYieldChange = (field: keyof YieldStructure, value: number) => {
    onYieldsChange({
      ...yields,
      [field]: value,
    });
  };

  const isYieldValid = Math.abs(yieldTotal - 100) < 0.01;

  const yieldFields: { key: keyof YieldStructure; label: string; color: string }[] = [
    { key: 'headRice', label: 'Head Rice', color: 'from-emerald-500 to-green-500' },
    { key: 'brokenRice', label: 'Broken Rice', color: 'from-amber-500 to-orange-500' },
    { key: 'bran', label: 'Bran', color: 'from-yellow-500 to-amber-500' },
    { key: 'param', label: 'Param (Short Broken)', color: 'from-orange-500 to-red-500' },
    { key: 'rejectionRice', label: 'Rejection Rice', color: 'from-red-500 to-pink-500' },
    { key: 'husk', label: 'Husk', color: 'from-gray-500 to-slate-500' },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 space-y-6 border border-gray-200">
      <div className="flex items-center justify-between border-b-2 border-purple-200 pb-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Sliders className="text-purple-600" size={28} />
          Yield Control Panel
        </h2>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-600">Total Yield</div>
          <div
            className={`text-2xl font-bold ${
              isYieldValid ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {yieldTotal.toFixed(2)}%
          </div>
        </div>
      </div>

      {!isYieldValid && (
        <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5 animate-pulse" size={20} />
          <div>
            <div className="font-semibold text-red-800">
              Yield Total Must Equal 100%
            </div>
            <div className="text-sm text-red-700 mt-1">
              Current total is {yieldTotal.toFixed(2)}%. Please adjust the yield
              percentages to total exactly 100%.
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {yieldFields.map(({ key, label, color }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className={`w-3 h-3 bg-gradient-to-r ${color} rounded-full`}></span>
                {label}
              </label>
              <input
                type="number"
                value={yields[key]}
                onChange={(e) =>
                  handleYieldChange(key, parseFloat(e.target.value) || 0)
                }
                className="w-24 px-3 py-1.5 border-2 border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={yields[key]}
                onChange={(e) =>
                  handleYieldChange(key, parseFloat(e.target.value))
                }
                className={`flex-1 h-3 bg-gradient-to-r ${color} rounded-lg appearance-none cursor-pointer`}
                min="0"
                max="100"
                step="0.1"
                style={{
                  background: `linear-gradient(to right,
                    rgb(${color.includes('emerald') ? '16, 185, 129' :
                         color.includes('amber') ? '245, 158, 11' :
                         color.includes('yellow') ? '234, 179, 8' :
                         color.includes('orange') && color.includes('red') ? '249, 115, 22' :
                         color.includes('red') ? '239, 68, 68' : '107, 114, 128'}) 0%,
                    rgb(${color.includes('green') ? '34, 197, 94' :
                         color.includes('orange') && !color.includes('red') ? '249, 115, 22' :
                         color.includes('amber') && !color.includes('yellow') ? '245, 158, 11' :
                         color.includes('red') && !color.includes('orange') ? '239, 68, 68' :
                         color.includes('pink') ? '236, 72, 153' : '71, 85, 105'}) ${yields[key]}%,
                    rgb(229, 231, 235) ${yields[key]}%)`
                }}
              />
              <span className="text-sm font-medium text-gray-600 w-16 text-right">
                {yields[key].toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
