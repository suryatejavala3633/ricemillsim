import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface GunnyInventory {
  id: string;
  user_id: string;
  bag_type: 'new' | 'used';
  bag_size: string;
  quantity: number;
  location: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GunnyTransaction {
  id: string;
  user_id: string;
  date: string;
  inventory_id: string;
  transaction_type: 'purchase' | 'usage' | 'return' | 'damaged' | 'adjustment';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  balance_after: number;
  notes?: string;
  created_at: string;
}

export class GunnyService extends BaseService {
  constructor() {
    super('gunny_inventory');
  }

  async getInventory(): Promise<GunnyInventory[]> {
    return this.getAll<GunnyInventory>('bag_type');
  }

  async getByType(bagType: GunnyInventory['bag_type']): Promise<GunnyInventory[]> {
    return this.query<GunnyInventory>({ bag_type: bagType });
  }

  async getTotalQuantity(): Promise<number> {
    const inventory = await this.getInventory();
    return inventory.reduce((sum, item) => sum + item.quantity, 0);
  }

  async addTransaction(
    inventoryId: string,
    transactionType: GunnyTransaction['transaction_type'],
    quantity: number,
    referenceType?: string,
    referenceId?: string,
    notes?: string
  ): Promise<GunnyTransaction> {
    const userId = await this.getUserId();

    const inventory = await this.getById<GunnyInventory>(inventoryId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    let newQuantity = inventory.quantity;
    if (transactionType === 'purchase' || transactionType === 'return') {
      newQuantity += quantity;
    } else if (transactionType === 'usage' || transactionType === 'damaged') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory');
      }
    } else if (transactionType === 'adjustment') {
      newQuantity = quantity;
    }

    const { data: transaction, error: transError } = await supabase
      .from('gunny_transactions')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        inventory_id: inventoryId,
        transaction_type: transactionType,
        quantity: quantity,
        reference_type: referenceType,
        reference_id: referenceId,
        balance_after: newQuantity,
        notes,
      })
      .select()
      .single();

    if (transError) throw transError;

    await this.update<GunnyInventory>(inventoryId, { quantity: newQuantity });

    return transaction as GunnyTransaction;
  }

  async getTransactions(inventoryId?: string, startDate?: string, endDate?: string): Promise<GunnyTransaction[]> {
    const userId = await this.getUserId();
    let query = supabase
      .from('gunny_transactions')
      .select('*')
      .eq('user_id', userId);

    if (inventoryId) {
      query = query.eq('inventory_id', inventoryId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data as GunnyTransaction[];
  }
}

export const gunnyService = new GunnyService();
