import { BaseService } from './BaseService';
import type { CMRPaddyReceipt, CMRRiceTarget } from '../types';
import { StockTransactionService } from './InventoryService';

export class CMRPaddyReceiptService extends BaseService<CMRPaddyReceipt> {
  private transactionService: StockTransactionService;

  constructor() {
    super('cmr_paddy_receipts');
    this.transactionService = new StockTransactionService();
  }

  async create(receipt: Omit<CMRPaddyReceipt, 'id' | 'user_id' | 'created_at' | 'updated_at'>, year: string = '2024-25'): Promise<CMRPaddyReceipt> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...receipt,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    if (receipt.gunnies_received > 0) {
      await this.transactionService.recordTransaction({
        item_type: 'gunnies',
        transaction_type: 'in',
        transaction_date: receipt.receipt_date,
        quantity: receipt.gunnies_received,
        frk_batch_id: null,
        reference_type: 'paddy_receipt',
        reference_id: data.id,
        from_location: receipt.supplier,
        notes: `Received with ${receipt.paddy_quantity_qtls} Qtls paddy - Vehicle: ${receipt.vehicle_number}`
      }, year);
    }

    return data;
  }

  async getTotalPaddyReceived(startDate?: string, endDate?: string): Promise<number> {
    const userId = await this.getUserId();

    const query = this.supabase
      .from(this.tableName)
      .select('paddy_quantity_qtls')
      .eq('user_id', userId);

    if (startDate) {
      query.gte('receipt_date', startDate);
    }
    if (endDate) {
      query.lte('receipt_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).reduce((total, receipt) => total + receipt.paddy_quantity_qtls, 0);
  }
}

export class CMRRiceTargetService extends BaseService<CMRRiceTarget> {
  constructor() {
    super('cmr_rice_target');
  }

  async getOrCreateTarget(year: string = '2024-25'): Promise<CMRRiceTarget> {
    const userId = await this.getUserId();

    const { data: existing, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('target_year', year)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      return existing;
    }

    const { data: newTarget, error: createError } = await this.supabase
      .from(this.tableName)
      .insert({
        user_id: userId,
        target_year: year,
        initial_target_qtls: 0,
        current_balance_qtls: 0,
        acks_completed: 0,
        notes: ''
      })
      .select()
      .single();

    if (createError) throw createError;
    return newTarget;
  }

  async setInitialTarget(year: string, targetQtls: number): Promise<void> {
    const userId = await this.getUserId();

    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('target_year', year)
      .maybeSingle();

    if (existing) {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({
          initial_target_qtls: targetQtls,
          current_balance_qtls: targetQtls,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      await this.supabase
        .from(this.tableName)
        .insert({
          user_id: userId,
          target_year: year,
          initial_target_qtls: targetQtls,
          current_balance_qtls: targetQtls,
          acks_completed: 0,
          notes: ''
        });
    }
  }

  async recordACKCompletion(year: string = '2024-25', ackRiceQtls: number = 287.1): Promise<void> {
    const userId = await this.getUserId();

    const target = await this.getOrCreateTarget(year);

    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        current_balance_qtls: target.current_balance_qtls - ackRiceQtls,
        acks_completed: target.acks_completed + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', target.id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getProgress(year: string = '2024-25'): Promise<{
    initial: number;
    delivered: number;
    remaining: number;
    percentage: number;
    acks: number;
  }> {
    const target = await this.getOrCreateTarget(year);

    const delivered = target.initial_target_qtls - target.current_balance_qtls;
    const percentage = target.initial_target_qtls > 0
      ? (delivered / target.initial_target_qtls) * 100
      : 0;

    return {
      initial: target.initial_target_qtls,
      delivered,
      remaining: target.current_balance_qtls,
      percentage,
      acks: target.acks_completed
    };
  }
}
