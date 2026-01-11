import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface WageRecord {
  id: string;
  user_id: string;
  date: string;
  employee_name: string;
  amount: number;
  payment_type: 'daily' | 'weekly' | 'monthly' | 'bonus' | 'advance' | 'deduction';
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class WagesService extends BaseService {
  constructor() {
    super('wages_records');
  }

  async getByEmployee(employeeName: string): Promise<WageRecord[]> {
    return this.query<WageRecord>({ employee_name: employeeName }, 'date', false);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<WageRecord[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as WageRecord[];
  }

  async getTotalByDateRange(startDate: string, endDate: string, status?: WageRecord['status']): Promise<number> {
    const records = await this.getByDateRange(startDate, endDate);
    return records
      .filter((r) => !status || r.status === status)
      .reduce((sum, r) => sum + r.amount, 0);
  }

  async markAsPaid(id: string): Promise<WageRecord> {
    return this.update<WageRecord>(id, { status: 'paid' });
  }
}

export const wagesService = new WagesService();
