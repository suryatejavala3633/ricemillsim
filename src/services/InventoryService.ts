import { BaseService } from './BaseService';
import type { StockItem, StockTransaction, ItemType, TransactionType, ReferenceType } from '../types';

export class InventoryService extends BaseService<StockItem> {
  constructor() {
    super('stock_items');
  }

  async initializeStockItems(year: string = '2024-25'): Promise<void> {
    const userId = await this.getUserId();

    const defaultItems: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
      {
        item_type: 'gunnies',
        item_name: `New Gunnies (${year})`,
        current_stock: 0,
        unit: 'pieces',
        reorder_level: 1000,
        year,
        notes: 'New gunnies for CMR rice packaging'
      },
      {
        item_type: 'stickers',
        item_name: `CMR Stickers (${year})`,
        current_stock: 0,
        unit: 'pieces',
        reorder_level: 1000,
        year,
        notes: 'CMR identification stickers'
      },
      {
        item_type: 'frk',
        item_name: 'Fortified Rice Kernels',
        current_stock: 0,
        unit: 'quintals',
        reorder_level: 50,
        year,
        notes: 'Fortified Rice Kernels for blending'
      }
    ];

    for (const item of defaultItems) {
      const { data: existing } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', item.item_type)
        .eq('year', year)
        .maybeSingle();

      if (!existing) {
        await this.supabase
          .from(this.tableName)
          .insert({
            ...item,
            user_id: userId
          });
      }
    }
  }

  async getStockByType(itemType: ItemType, year?: string): Promise<StockItem | null> {
    const userId = await this.getUserId();

    const query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', itemType);

    if (year) {
      query.eq('year', year);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateStock(itemType: ItemType, quantity: number, year: string = '2024-25'): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        current_stock: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('year', year);

    if (error) throw error;
  }

  async adjustStock(itemType: ItemType, adjustment: number, year: string = '2024-25'): Promise<void> {
    const stock = await this.getStockByType(itemType, year);
    if (!stock) throw new Error('Stock item not found');

    const newStock = stock.current_stock + adjustment;
    await this.updateStock(itemType, newStock, year);
  }

  async getLowStockItems(): Promise<StockItem[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('current_stock', { ascending: true });

    if (error) throw error;

    return (data || []).filter(item => item.current_stock <= item.reorder_level);
  }
}

export class StockTransactionService extends BaseService<StockTransaction> {
  private inventoryService: InventoryService;

  constructor() {
    super('stock_transactions');
    this.inventoryService = new InventoryService();
  }

  async recordTransaction(
    transaction: Omit<StockTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    year: string = '2024-25'
  ): Promise<StockTransaction> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...transaction,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    const adjustment = transaction.transaction_type === 'in' ? transaction.quantity : -transaction.quantity;
    await this.inventoryService.adjustStock(transaction.item_type, adjustment, year);

    return data;
  }

  async getTransactionsByType(itemType: ItemType, limit?: number): Promise<StockTransaction[]> {
    const userId = await this.getUserId();

    const query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .order('transaction_date', { ascending: false });

    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getTransactionsByReference(referenceType: ReferenceType, referenceId: string): Promise<StockTransaction[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('reference_type', referenceType)
      .eq('reference_id', referenceId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async recordACKProduction(ackNumber: string, year: string = '2024-25'): Promise<void> {
    const ACK_CONSUMPTION = {
      cmr_rice_qtls: 287.1,
      frk_qtls: 2.9,
      gunnies: 580,
      stickers: 580
    };

    await this.recordTransaction({
      item_type: 'frk',
      transaction_type: 'out',
      transaction_date: new Date().toISOString().split('T')[0],
      quantity: ACK_CONSUMPTION.frk_qtls,
      frk_batch_id: null,
      reference_type: 'ack_production',
      reference_id: ackNumber,
      from_location: '',
      notes: `ACK ${ackNumber} production - FRK consumption`
    }, year);

    await this.recordTransaction({
      item_type: 'gunnies',
      transaction_type: 'out',
      transaction_date: new Date().toISOString().split('T')[0],
      quantity: ACK_CONSUMPTION.gunnies,
      frk_batch_id: null,
      reference_type: 'ack_production',
      reference_id: ackNumber,
      from_location: '',
      notes: `ACK ${ackNumber} production - Gunnies used`
    }, year);

    await this.recordTransaction({
      item_type: 'stickers',
      transaction_type: 'out',
      transaction_date: new Date().toISOString().split('T')[0],
      quantity: ACK_CONSUMPTION.stickers,
      frk_batch_id: null,
      reference_type: 'ack_production',
      reference_id: ackNumber,
      from_location: '',
      notes: `ACK ${ackNumber} production - Stickers used`
    }, year);
  }
}
