import { BaseService } from './BaseService';

export interface ProductionBatch {
  id: string;
  user_id: string;
  batch_no: string;
  date: string;
  paddy_quantity_standard: number;
  paddy_quantity_actual: number;
  rice_type: 'raw' | 'boiled';
  use_41kg_bags: boolean;
  yields: {
    headRice: number;
    brokenRice: number;
    bran: number;
    param: number;
    rejectionRice: number;
    husk: number;
  };
  head_rice_produced: number;
  byproducts: Record<string, any>;
  working_costs: Record<string, any>;
  status: 'in_progress' | 'completed' | 'delivered';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class ProductionService extends BaseService {
  constructor() {
    super('production_batches');
  }

  async getByBatchNo(batchNo: string): Promise<ProductionBatch | null> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('batch_no', batchNo)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as ProductionBatch | null;
  }

  async getByDateRange(startDate: string, endDate: string): Promise<ProductionBatch[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as ProductionBatch[];
  }

  async getByStatus(status: ProductionBatch['status']): Promise<ProductionBatch[]> {
    return this.query<ProductionBatch>({ status }, 'date', false);
  }

  async updateStatus(id: string, status: ProductionBatch['status']): Promise<ProductionBatch> {
    return this.update<ProductionBatch>(id, { status });
  }

  async generateBatchNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const batches = await this.getByDateRange(
      date.toISOString().split('T')[0],
      date.toISOString().split('T')[0]
    );
    const sequence = (batches.length + 1).toString().padStart(3, '0');
    return `BATCH-${dateStr}-${sequence}`;
  }
}

import { supabase } from '../lib/supabase';

export const productionService = new ProductionService();
