import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface CMRPaddyReceipt {
  id: string;
  user_id: string;
  season: string;
  receipt_date: string;
  paddy_quantity_qtls: number;
  paddy_bags: number;
  gunnies_received: number;
  vehicle_number: string;
  supplier: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export class CMRPaddyReceiptService extends BaseService<CMRPaddyReceipt> {
  constructor() {
    super('cmr_paddy_receipts');
  }

  async addReceipt(data: Partial<CMRPaddyReceipt>): Promise<CMRPaddyReceipt> {
    const userId = await this.getUserId();

    const { data: receipt, error } = await supabase
      .from(this.tableName)
      .insert({
        ...data,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return receipt as CMRPaddyReceipt;
  }

  async getReceiptsBySeason(season: string): Promise<CMRPaddyReceipt[]> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .order('receipt_date', { ascending: false });

    if (error) throw error;
    return data as CMRPaddyReceipt[];
  }

  async deleteReceipt(id: string): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
