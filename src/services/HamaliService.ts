import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface HamaliRecord {
  id: string;
  user_id: string;
  date: string;
  worker_name: string;
  quantity: number;
  rate: number;
  total_amount: number;
  operation_type: 'loading' | 'unloading';
  material_type: 'paddy' | 'rice' | 'byproduct' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class HamaliService extends BaseService {
  constructor() {
    super('hamali_records');
  }

  async getByWorker(workerName: string): Promise<HamaliRecord[]> {
    return this.query<HamaliRecord>({ worker_name: workerName }, 'date', false);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<HamaliRecord[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as HamaliRecord[];
  }

  async getTotalByDateRange(startDate: string, endDate: string): Promise<number> {
    const records = await this.getByDateRange(startDate, endDate);
    return records.reduce((sum, r) => sum + r.total_amount, 0);
  }

  async getByOperationType(operationType: HamaliRecord['operation_type']): Promise<HamaliRecord[]> {
    return this.query<HamaliRecord>({ operation_type: operationType }, 'date', false);
  }
}

export const hamaliService = new HamaliService();
