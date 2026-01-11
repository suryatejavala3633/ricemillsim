import { BaseService } from './BaseService';
import type { ProductionReport, ProductionAnalysis } from '../types';

export class ProductionReportService extends BaseService<ProductionReport> {
  constructor() {
    super('production_reports');
  }

  async getReportsWithAnalysis(): Promise<ProductionAnalysis[]> {
    const reports = await this.getAll();
    const analyses: ProductionAnalysis[] = [];

    for (const report of reports) {
      const analysis = this.analyzeProduction(report);
      analyses.push(analysis);
    }

    return analyses;
  }

  analyzeProduction(report: ProductionReport): ProductionAnalysis {
    const total_rice_output = report.raw_rice_qty;
    const total_byproducts =
      report.broken_rice_qty +
      report.bran_qty +
      report.param_qty +
      report.rejection_rice_qty +
      report.husk_qty;

    const total_output = total_rice_output + total_byproducts;

    const paddy_consumed = total_output;

    const actual_yields = {
      headRice: paddy_consumed > 0 ? (report.raw_rice_qty / paddy_consumed) * 100 : 0,
      brokenRice: paddy_consumed > 0 ? (report.broken_rice_qty / paddy_consumed) * 100 : 0,
      bran: paddy_consumed > 0 ? (report.bran_qty / paddy_consumed) * 100 : 0,
      param: paddy_consumed > 0 ? (report.param_qty / paddy_consumed) * 100 : 0,
      rejectionRice: paddy_consumed > 0 ? (report.rejection_rice_qty / paddy_consumed) * 100 : 0,
      husk: paddy_consumed > 0 ? (report.husk_qty / paddy_consumed) * 100 : 0
    };

    const fortified_rice_qty = report.raw_rice_qty + report.frk_qty;
    const fortified_rice_composition = {
      raw_rice: fortified_rice_qty > 0 ? (report.raw_rice_qty / fortified_rice_qty) * 100 : 0,
      frk: fortified_rice_qty > 0 ? (report.frk_qty / fortified_rice_qty) * 100 : 0
    };

    return {
      report,
      total_output,
      total_rice_output,
      paddy_consumed,
      actual_yields,
      fortified_rice_qty,
      fortified_rice_composition
    };
  }

  async create(report: Omit<ProductionReport, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ProductionReport> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...report,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
