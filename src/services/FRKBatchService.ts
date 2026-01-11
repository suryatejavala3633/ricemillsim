import { BaseService } from './BaseService';
import type { FRKBatch, BatchStatus } from '../types';

export class FRKBatchService extends BaseService<FRKBatch> {
  constructor() {
    super('frk_batches');
  }

  async create(batch: Omit<FRKBatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FRKBatch> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...batch,
        current_stock_qtls: batch.quantity_qtls,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStock(batchId: string, stockChange: number): Promise<void> {
    const userId = await this.getUserId();

    const { data: batch, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newStock = batch.current_stock_qtls + stockChange;
    const status: BatchStatus = newStock <= 0 ? 'depleted' : batch.status;

    const { error: updateError } = await this.supabase
      .from(this.tableName)
      .update({
        current_stock_qtls: Math.max(0, newStock),
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', batchId)
      .eq('user_id', userId);

    if (updateError) throw updateError;
  }

  async getActiveBatches(): Promise<FRKBatch[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_stock_qtls', 0)
      .order('received_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async checkExpiringBatches(daysThreshold: number = 30): Promise<FRKBatch[]> {
    const userId = await this.getUserId();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`kernel_test_expiry.lte.${thresholdDate.toISOString()},premix_test_expiry.lte.${thresholdDate.toISOString()}`)
      .order('kernel_test_expiry', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getTotalStock(): Promise<number> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('current_stock_qtls')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    return (data || []).reduce((total, batch) => total + batch.current_stock_qtls, 0);
  }

  async getOldestBatch(): Promise<FRKBatch | null> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_stock_qtls', 0)
      .order('received_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
