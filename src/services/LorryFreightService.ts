import { BaseService } from './BaseService';
import type { LorryFreight, TransporterDues } from '../types';

export class LorryFreightService extends BaseService<LorryFreight> {
  constructor() {
    super('lorry_freight');
  }

  async getFreightBySeason(season: string): Promise<LorryFreight[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .order('delivery_date', { ascending: false });

    if (error) throw error;
    return data as LorryFreight[];
  }

  async createFreightEntry(freight: Partial<LorryFreight>): Promise<LorryFreight> {
    const userId = await this.getUserId();

    const totalFreight = (freight.quantity_qtls || 290) * (freight.freight_rate || 0);
    const balanceDue = totalFreight - (freight.advance_paid || 0);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...freight,
        user_id: userId,
        total_freight: totalFreight,
        balance_due: balanceDue,
        payment_status: balanceDue <= 0 ? 'paid' : (freight.advance_paid || 0) > 0 ? 'partial' : 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as LorryFreight;
  }

  async updateFreightEntry(id: string, updates: Partial<LorryFreight>): Promise<LorryFreight> {
    const userId = await this.getUserId();

    const totalFreight = updates.quantity_qtls && updates.freight_rate
      ? updates.quantity_qtls * updates.freight_rate
      : undefined;

    const balanceDue = totalFreight !== undefined && updates.advance_paid !== undefined
      ? totalFreight - updates.advance_paid
      : undefined;

    const payment_status = balanceDue !== undefined
      ? balanceDue <= 0 ? 'paid' : (updates.advance_paid || 0) > 0 ? 'partial' : 'pending'
      : undefined;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...updates,
        ...(totalFreight !== undefined && { total_freight: totalFreight }),
        ...(balanceDue !== undefined && { balance_due: balanceDue }),
        ...(payment_status && { payment_status }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as LorryFreight;
  }

  async getTransporterDues(season: string): Promise<TransporterDues[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('transporter_id, transporter_name, total_freight, advance_paid')
      .eq('user_id', userId)
      .eq('season', season)
      .not('transporter_name', 'is', null);

    if (error) throw error;

    const duesMap = new Map<string, TransporterDues>();

    data.forEach((entry: any) => {
      const key = entry.transporter_id || entry.transporter_name;
      if (!duesMap.has(key)) {
        duesMap.set(key, {
          transporter_id: entry.transporter_id || '',
          transporter_name: entry.transporter_name,
          total_freight: 0,
          total_paid: 0,
          balance_due: 0,
          delivery_count: 0
        });
      }

      const dues = duesMap.get(key)!;
      dues.total_freight += entry.total_freight || 0;
      dues.total_paid += entry.advance_paid || 0;
      dues.delivery_count += 1;
    });

    const result = Array.from(duesMap.values()).map(dues => ({
      ...dues,
      balance_due: dues.total_freight - dues.total_paid
    }));

    return result.sort((a, b) => b.balance_due - a.balance_due);
  }

  async recordPayment(id: string, paymentAmount: number): Promise<LorryFreight> {
    const userId = await this.getUserId();

    const { data: existing, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newAdvancePaid = (existing.advance_paid || 0) + paymentAmount;
    const newBalanceDue = existing.total_freight - newAdvancePaid;
    const newPaymentStatus = newBalanceDue <= 0 ? 'paid' : newAdvancePaid > 0 ? 'partial' : 'pending';

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        advance_paid: newAdvancePaid,
        balance_due: newBalanceDue,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as LorryFreight;
  }
}
