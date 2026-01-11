import { MillingScenario, CalculationResults, ByProduct, RiceType, ACKCalculationResults } from './types';

const RAW_RICE_OUTTURN = 0.67;
const BOILED_RICE_OUTTURN = 0.68;

export function getWeightFactor(use41KgBags: boolean): number {
  return use41KgBags ? 1.025 : 1.0;
}

export function getOutTurnRate(riceType: RiceType): number {
  return riceType === 'raw' ? RAW_RICE_OUTTURN : BOILED_RICE_OUTTURN;
}

export function calculateTotalYield(yields: MillingScenario['yields']): number {
  return (
    yields.headRice +
    yields.brokenRice +
    yields.bran +
    yields.param +
    yields.rejectionRice +
    yields.husk
  );
}

export function calculateResults(scenario: MillingScenario): CalculationResults {
  const standardPaddy = scenario.paddyQuantity;
  const weightFactor = getWeightFactor(scenario.use41KgBags);
  const actualPaddy = standardPaddy * weightFactor;
  const outTurnRate = getOutTurnRate(scenario.riceType);
  const requiredRice = standardPaddy * outTurnRate;
  const actualHeadRice = (actualPaddy * scenario.yields.headRice) / 100;
  const riceShortfall = Math.max(requiredRice - actualHeadRice, 0);
  const riceShortfallCost = riceShortfall * scenario.ricePurchaseRate;

  const byProducts: ByProduct[] = [
    {
      name: 'Broken Rice',
      yieldPercent: scenario.yields.brokenRice,
      quantity: (actualPaddy * scenario.yields.brokenRice) / 100,
      rate: scenario.byProductRates.brokenRice,
      value: 0,
    },
    {
      name: 'Bran',
      yieldPercent: scenario.yields.bran,
      quantity: (actualPaddy * scenario.yields.bran) / 100,
      rate: scenario.byProductRates.bran,
      value: 0,
    },
    {
      name: 'Param (Short Broken)',
      yieldPercent: scenario.yields.param,
      quantity: (actualPaddy * scenario.yields.param) / 100,
      rate: scenario.byProductRates.param,
      value: 0,
    },
    {
      name: 'Rejection Rice',
      yieldPercent: scenario.yields.rejectionRice,
      quantity: (actualPaddy * scenario.yields.rejectionRice) / 100,
      rate: scenario.byProductRates.rejectionRice,
      value: 0,
    },
    {
      name: 'Husk',
      yieldPercent: scenario.yields.husk,
      quantity: (actualPaddy * scenario.yields.husk) / 100,
      rate: scenario.byProductRates.husk,
      value: 0,
    },
  ];

  byProducts.forEach((product) => {
    product.value = product.quantity * product.rate;
  });

  const totalByProductRevenue = byProducts.reduce(
    (sum, product) => sum + product.value,
    0
  );

  const totalWorkingCosts = Object.values(scenario.workingCosts).reduce(
    (sum, cost) => sum + cost,
    0
  );

  const netBalance =
    totalByProductRevenue - riceShortfallCost - totalWorkingCosts;

  const yieldTotal = calculateTotalYield(scenario.yields);

  return {
    standardPaddy,
    actualPaddy,
    requiredRice,
    actualHeadRice,
    riceShortfall,
    riceShortfallCost,
    byProducts,
    totalByProductRevenue,
    totalWorkingCosts,
    netBalance,
    yieldTotal,
  };
}

export function calculateACKRequirements(
  targetRice: number,
  riceType: RiceType,
  yields: MillingScenario['yields'],
  byProductRates: MillingScenario['byProductRates'],
  ricePurchaseRate: number,
  workingCosts: WorkingCosts,
  totalPaddyQuantity: number,
  use41KgBags: boolean
): ACKCalculationResults {
  const outTurnRate = getOutTurnRate(riceType);
  const requiredStandardPaddy = targetRice / outTurnRate;
  const weightFactor = getWeightFactor(use41KgBags);
  const requiredActualPaddy = requiredStandardPaddy * weightFactor;

  const actualHeadRice = (requiredActualPaddy * yields.headRice) / 100;
  const riceShortfall = Math.max(targetRice - actualHeadRice, 0);
  const riceShortfallCost = riceShortfall * ricePurchaseRate;

  const byProducts: ByProduct[] = [
    {
      name: 'Broken Rice',
      yieldPercent: yields.brokenRice,
      quantity: (requiredActualPaddy * yields.brokenRice) / 100,
      rate: byProductRates.brokenRice,
      value: 0,
    },
    {
      name: 'Bran',
      yieldPercent: yields.bran,
      quantity: (requiredActualPaddy * yields.bran) / 100,
      rate: byProductRates.bran,
      value: 0,
    },
    {
      name: 'Param (Short Broken)',
      yieldPercent: yields.param,
      quantity: (requiredActualPaddy * yields.param) / 100,
      rate: byProductRates.param,
      value: 0,
    },
    {
      name: 'Rejection Rice',
      yieldPercent: yields.rejectionRice,
      quantity: (requiredActualPaddy * yields.rejectionRice) / 100,
      rate: byProductRates.rejectionRice,
      value: 0,
    },
    {
      name: 'Husk',
      yieldPercent: yields.husk,
      quantity: (requiredActualPaddy * yields.husk) / 100,
      rate: byProductRates.husk,
      value: 0,
    },
  ];

  byProducts.forEach((product) => {
    product.value = product.quantity * product.rate;
  });

  const totalByProductRevenue = byProducts.reduce(
    (sum, product) => sum + product.value,
    0
  );

  const totalWorkingCostsForAllPaddy = Object.values(workingCosts).reduce(
    (sum, cost) => sum + cost,
    0
  );

  const totalActualPaddyForAllPaddy = totalPaddyQuantity * weightFactor;
  const proportionalWorkingCosts = totalActualPaddyForAllPaddy > 0
    ? (requiredActualPaddy / totalActualPaddyForAllPaddy) * totalWorkingCostsForAllPaddy
    : 0;

  const netProfit = totalByProductRevenue - riceShortfallCost - proportionalWorkingCosts;

  return {
    targetRice,
    requiredStandardPaddy,
    requiredActualPaddy,
    actualHeadRice,
    riceShortfall,
    riceShortfallCost,
    byProducts,
    totalByProductRevenue,
    totalWorkingCosts: proportionalWorkingCosts,
    netProfit,
  };
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatQuantity(quantity: number): string {
  return quantity.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
