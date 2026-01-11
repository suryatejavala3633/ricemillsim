import { useState, useEffect } from 'react';
import { FileDown, FileSpreadsheet, RotateCcw, Upload, Download } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Layout from './components/layout/Layout';
import CMRPaddyDashboard from './components/CMRPaddyDashboard';
import CMRSeasonDetails from './components/CMRSeasonDetails';
import InputForm from './components/InputForm';
import YieldControl from './components/YieldControl';
import ByProductTable from './components/ByProductTable';
import FinancialSummary from './components/FinancialSummary';
import ACKCalculator from './components/ACKCalculator';
import PurchaseAnalysis from './components/PurchaseAnalysis';
import PricingList from './components/PricingList';
import PowerFactorTracker from './components/PowerFactorTracker';
import ProductionTracker from './components/ProductionTracker';
import ByProductSalesManager from './components/ByProductSalesManager';
import InventoryManager from './components/InventoryManager';
import LorryFreightManager from './components/LorryFreightManager';
import WagesManager from './components/WagesManager';
import HamaliWorkManager from './components/HamaliWorkManager';
import { MillingScenario, RiceType, WorkingCosts, YieldStructure } from './types';
import { calculateResults } from './calculations';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import { saveScenario, loadScenario, getDefaultScenario } from './utils/storage';
import { exportScenarioToFile, importScenarioFromFile } from './utils/importExport';
import { syncEngine } from './services/SyncEngine';

type TabType = 'cmr-paddy' | 'production' | 'lorry-freight' | 'wages' | 'hamali' | 'inventory' | 'sales' | 'pricing' | 'power-factor' | 'calculator' | 'ack' | 'purchase';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      syncEngine.start();
      return () => {
        syncEngine.stop();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('cmr-paddy');
  const [scenario, setScenario] = useState<MillingScenario>(() => {
    const loaded = loadScenario();
    return loaded || getDefaultScenario();
  });

  useEffect(() => {
    saveScenario(scenario);
  }, [scenario]);

  const results = calculateResults(scenario);

  const handlePaddyQuantityChange = (value: number) => {
    setScenario((prev) => ({ ...prev, paddyQuantity: value }));
  };

  const handleRiceTypeChange = (value: RiceType) => {
    setScenario((prev) => ({ ...prev, riceType: value }));
  };

  const handleRicePurchaseRateChange = (value: number) => {
    setScenario((prev) => ({ ...prev, ricePurchaseRate: value }));
  };

  const handleWorkingCostsChange = (costs: WorkingCosts) => {
    setScenario((prev) => ({ ...prev, workingCosts: costs }));
  };

  const handleYieldsChange = (yields: YieldStructure) => {
    setScenario((prev) => ({ ...prev, yields }));
  };

  const handleByProductRateChange = (
    product: 'brokenRice' | 'bran' | 'param' | 'rejectionRice' | 'husk',
    rate: number
  ) => {
    setScenario((prev) => ({
      ...prev,
      byProductRates: {
        ...prev.byProductRates,
        [product]: rate,
      },
    }));
  };

  const handleBagWeightToggle = (use41Kg: boolean) => {
    setScenario((prev) => ({ ...prev, use41KgBags: use41Kg }));
  };

  const handleReset = () => {
    if (confirm('Reset all values to defaults? This will clear your current data.')) {
      setScenario(getDefaultScenario());
    }
  };

  const handleExportExcel = () => {
    exportToExcel(scenario, results);
  };

  const handleExportPDF = () => {
    exportToPDF(scenario, results);
  };

  const handleExportScenario = () => {
    exportScenarioToFile(scenario);
  };

  const handleImportScenario = async () => {
    try {
      const imported = await importScenarioFromFile();
      setScenario(imported);
    } catch (error) {
      alert('Failed to import scenario: ' + (error as Error).message);
    }
  };

  return (
    <Layout currentView={activeTab} onViewChange={(view) => setActiveTab(view as TabType)}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs font-medium tracking-wide uppercase">Quick Actions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleImportScenario}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all text-xs font-medium"
            >
              <Upload size={14} />
              Import
            </button>
            <button
              onClick={handleExportScenario}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all text-xs font-medium"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gray-500/10 text-gray-400 hover:text-gray-300 border border-white/10 hover:border-gray-500/30 rounded-xl transition-all text-xs font-medium"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all text-xs font-medium"
            >
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 rounded-xl transition-all text-xs font-medium"
            >
              <FileDown size={14} />
              PDF
            </button>
          </div>
        </div>

        {activeTab === 'cmr-paddy' ? (
          <CMRSeasonDetails />
        ) : activeTab === 'calculator' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <InputForm
                  paddyQuantity={scenario.paddyQuantity}
                  riceType={scenario.riceType}
                  ricePurchaseRate={scenario.ricePurchaseRate}
                  workingCosts={scenario.workingCosts}
                  use41KgBags={scenario.use41KgBags}
                  onPaddyQuantityChange={handlePaddyQuantityChange}
                  onRiceTypeChange={handleRiceTypeChange}
                  onRicePurchaseRateChange={handleRicePurchaseRateChange}
                  onWorkingCostsChange={handleWorkingCostsChange}
                  onBagWeightToggle={handleBagWeightToggle}
                />

                <YieldControl
                  yields={scenario.yields}
                  yieldTotal={results.yieldTotal}
                  onYieldsChange={handleYieldsChange}
                />
              </div>

              <div className="space-y-6">
                <ByProductTable
                  byProducts={results.byProducts}
                  totalRevenue={results.totalByProductRevenue}
                  byProductRates={scenario.byProductRates}
                  onRateChange={handleByProductRateChange}
                />

                <FinancialSummary
                  results={results}
                  workingCosts={scenario.workingCosts}
                  riceType={scenario.riceType}
                />
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 backdrop-blur-sm border border-cyan-700 rounded-2xl p-6">
              <h3 className="font-bold text-cyan-300 mb-3 text-lg">Key Assumptions</h3>
              <ul className="text-sm text-cyan-100 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Paddy bags: {scenario.use41KgBags ? '40 kg nominal, 41 kg actual (2.5% excess)' : '40 kg per bag (no excess)'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Raw rice out-turn: 67% | Boiled rice out-turn: 68%
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  CMR obligation uses standard weight, by-products use actual weight
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Rice shortfall must be purchased at market rate
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  All calculations use conservative assumptions
                </li>
              </ul>
            </div>
          </>
        ) : activeTab === 'ack' ? (
          <ACKCalculator
            riceType={scenario.riceType}
            yields={scenario.yields}
            byProductRates={scenario.byProductRates}
            ricePurchaseRate={scenario.ricePurchaseRate}
            workingCosts={scenario.workingCosts}
            totalPaddyQuantity={scenario.paddyQuantity}
            use41KgBags={scenario.use41KgBags}
            onRiceTypeChange={handleRiceTypeChange}
            onRicePurchaseRateChange={handleRicePurchaseRateChange}
          />
        ) : activeTab === 'purchase' ? (
          <PurchaseAnalysis
            yields={scenario.yields}
            byProductRates={scenario.byProductRates}
            workingCosts={scenario.workingCosts}
            use41KgBags={scenario.use41KgBags}
            totalPaddyQuantity={scenario.paddyQuantity}
          />
        ) : activeTab === 'pricing' ? (
          <PricingList />
        ) : activeTab === 'power-factor' ? (
          <PowerFactorTracker />
        ) : activeTab === 'production' ? (
          <ProductionTracker />
        ) : activeTab === 'lorry-freight' ? (
          <LorryFreightManager />
        ) : activeTab === 'wages' ? (
          <WagesManager />
        ) : activeTab === 'hamali' ? (
          <HamaliWorkManager />
        ) : activeTab === 'sales' ? (
          <ByProductSalesManager />
        ) : activeTab === 'inventory' ? (
          <InventoryManager />
        ) : (
          <CMRSeasonDetails />
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Data securely saved to cloud database with automatic backup and sync.</p>
        </div>
      </div>
    </Layout>
  );
}

export default App;
