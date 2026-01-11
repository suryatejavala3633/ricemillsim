import { MillingScenario } from '../types';

const STORAGE_KEY = 'cmr_milling_scenario';

export function saveScenario(scenario: MillingScenario): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
  } catch (error) {
    console.error('Failed to save scenario:', error);
  }
}

export function loadScenario(): MillingScenario | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.use41KgBags === undefined) {
        parsed.use41KgBags = true;
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load scenario:', error);
  }
  return null;
}

export function getDefaultScenario(): MillingScenario {
  return {
    paddyQuantity: 1000,
    riceType: 'raw',
    ricePurchaseRate: 4000,
    workingCosts: {
      electricity: 5000,
      labour: 3000,
      salaries: 2000,
      hamali: 1500,
      spares: 1000,
      fciExpenses: 500,
      others: 500,
    },
    yields: {
      headRice: 67,
      brokenRice: 10,
      bran: 8,
      param: 3,
      rejectionRice: 2,
      husk: 10,
    },
    byProductRates: {
      brokenRice: 3500,
      bran: 2000,
      param: 2500,
      rejectionRice: 1500,
      husk: 500,
    },
    use41KgBags: true,
  };
}
