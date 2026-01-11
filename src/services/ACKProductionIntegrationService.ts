import { StockTransactionService, InventoryService } from './InventoryService';
import { CMRRiceTargetService } from './CMRService';

export const ACK_CONSUMPTION = {
  CMR_RICE_QTLS: 287.1,
  FRK_QTLS: 2.9,
  GUNNIES: 580,
  STICKERS: 580
};

export class ACKProductionIntegrationService {
  private transactionService: StockTransactionService;
  private inventoryService: InventoryService;
  private targetService: CMRRiceTargetService;

  constructor() {
    this.transactionService = new StockTransactionService();
    this.inventoryService = new InventoryService();
    this.targetService = new CMRRiceTargetService();
  }

  async recordACKProduction(ackNumber: string, year: string = '2024-25'): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const availability = await this.checkStockAvailability(year);

      if (!availability.canProduce) {
        return {
          success: false,
          message: `Insufficient stock: ${availability.issues.join(', ')}`
        };
      }

      await this.transactionService.recordACKProduction(ackNumber, year);
      await this.targetService.recordACKCompletion(year, ACK_CONSUMPTION.CMR_RICE_QTLS);

      return {
        success: true,
        message: `ACK ${ackNumber} production recorded successfully`
      };
    } catch (error) {
      console.error('Error recording ACK production:', error);
      return {
        success: false,
        message: 'Failed to record ACK production'
      };
    }
  }

  async checkStockAvailability(year: string = '2024-25'): Promise<{
    canProduce: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const frkStock = await this.inventoryService.getStockByType('frk', year);
      if (!frkStock || frkStock.current_stock < ACK_CONSUMPTION.FRK_QTLS) {
        issues.push(`FRK (need ${ACK_CONSUMPTION.FRK_QTLS} Qtls, have ${frkStock?.current_stock || 0} Qtls)`);
      }

      const gunniesStock = await this.inventoryService.getStockByType('gunnies', year);
      if (!gunniesStock || gunniesStock.current_stock < ACK_CONSUMPTION.GUNNIES) {
        issues.push(`Gunnies (need ${ACK_CONSUMPTION.GUNNIES} pcs, have ${gunniesStock?.current_stock || 0} pcs)`);
      }

      const stickersStock = await this.inventoryService.getStockByType('stickers', year);
      if (!stickersStock || stickersStock.current_stock < ACK_CONSUMPTION.STICKERS) {
        issues.push(`Stickers (need ${ACK_CONSUMPTION.STICKERS} pcs, have ${stickersStock?.current_stock || 0} pcs)`);
      }
    } catch (error) {
      console.error('Error checking stock availability:', error);
      issues.push('Error checking stock levels');
    }

    return {
      canProduce: issues.length === 0,
      issues
    };
  }

  async getACKProductionEstimate(year: string = '2024-25'): Promise<{
    possibleACKs: number;
    limitingFactor: string;
  }> {
    try {
      const frkStock = await this.inventoryService.getStockByType('frk', year);
      const gunniesStock = await this.inventoryService.getStockByType('gunnies', year);
      const stickersStock = await this.inventoryService.getStockByType('stickers', year);

      const frkACKs = frkStock ? Math.floor(frkStock.current_stock / ACK_CONSUMPTION.FRK_QTLS) : 0;
      const gunniesACKs = gunniesStock ? Math.floor(gunniesStock.current_stock / ACK_CONSUMPTION.GUNNIES) : 0;
      const stickersACKs = stickersStock ? Math.floor(stickersStock.current_stock / ACK_CONSUMPTION.STICKERS) : 0;

      const minACKs = Math.min(frkACKs, gunniesACKs, stickersACKs);

      let limitingFactor = '';
      if (minACKs === frkACKs) limitingFactor = 'FRK';
      else if (minACKs === gunniesACKs) limitingFactor = 'Gunnies';
      else if (minACKs === stickersACKs) limitingFactor = 'Stickers';

      return {
        possibleACKs: minACKs,
        limitingFactor
      };
    } catch (error) {
      console.error('Error calculating ACK estimate:', error);
      return {
        possibleACKs: 0,
        limitingFactor: 'Error'
      };
    }
  }
}
