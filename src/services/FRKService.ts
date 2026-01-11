import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface FRKInventory {
  id: string;
  user_id: string;
  batch_no: string;
  quantity: number;
  expiry_date?: string;
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FRKUsage {
  id: string;
  user_id: string;
  production_batch_id: string;
  frk_inventory_id: string;
  date: string;
  quantity_used: number;
  rice_quantity: number;
  ratio_percentage: number;
  notes?: string;
  created_at: string;
}

export class FRKService extends BaseService {
  constructor() {
    super('frk_inventory');
  }

  async getInventory(): Promise<FRKInventory[]> {
    return this.getAll<FRKInventory>('expiry_date', true);
  }

  async getTotalQuantity(): Promise<number> {
    const inventory = await this.getInventory();
    return inventory.reduce((sum, item) => sum + item.quantity, 0);
  }

  async getAvailableInventory(): Promise<FRKInventory[]> {
    const userId = await this.getUserId();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gt('quantity', 0)
      .or(`expiry_date.is.null,expiry_date.gte.${today}`)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as FRKInventory[];
  }

  async recordUsage(
    productionBatchId: string,
    frkInventoryId: string,
    quantityUsed: number,
    riceQuantity: number,
    notes?: string
  ): Promise<FRKUsage> {
    const userId = await this.getUserId();

    const inventory = await this.getById<FRKInventory>(frkInventoryId);
    if (!inventory) {
      throw new Error('FRK Inventory not found');
    }

    if (inventory.quantity < quantityUsed) {
      throw new Error('Insufficient FRK inventory');
    }

    const { data: usage, error: usageError } = await supabase
      .from('frk_usage')
      .insert({
        user_id: userId,
        production_batch_id: productionBatchId,
        frk_inventory_id: frkInventoryId,
        date: new Date().toISOString().split('T')[0],
        quantity_used: quantityUsed,
        rice_quantity: riceQuantity,
        notes,
      })
      .select()
      .single();

    if (usageError) throw usageError;

    const newQuantity = inventory.quantity - quantityUsed;
    await this.update<FRKInventory>(frkInventoryId, { quantity: newQuantity });

    return usage as FRKUsage;
  }

  async getUsageByBatch(batchId: string): Promise<FRKUsage[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('frk_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('production_batch_id', batchId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as FRKUsage[];
  }

  async getUsageByDateRange(startDate: string, endDate: string): Promise<FRKUsage[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('frk_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as FRKUsage[];
  }
}

export const frkService = new FRKService();
