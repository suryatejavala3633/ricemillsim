import { BaseService } from './BaseService';
import type { ByProductRate, ByProductType } from '../types';

export class ByProductRateService extends BaseService<ByProductRate> {
  constructor() {
    super('byproduct_rates');
  }

  async create(rate: Omit<ByProductRate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ByProductRate> {
    const userId = await this.getUserId();

    if (rate.is_active) {
      await this.deactivateOtherRates(rate.byproduct_type);
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...rate,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveRates(): Promise<Record<ByProductType, number>> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('effective_from', { ascending: false });

    if (error) throw error;

    const rates: Record<string, number> = {};
    const byProductTypes: ByProductType[] = ['broken_rice', 'bran', 'param', 'rejection_rice', 'husk'];

    byProductTypes.forEach(type => {
      const rate = data?.find(r => r.byproduct_type === type);
      rates[type] = rate?.rate || 0;
    });

    return rates as Record<ByProductType, number>;
  }

  async getActiveRateForType(type: ByProductType): Promise<number> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('byproduct_type', type)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.rate || 0;
  }

  async getRateHistory(type: ByProductType): Promise<ByProductRate[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('byproduct_type', type)
      .order('effective_from', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async deactivateOtherRates(type: ByProductType): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await this.supabase
      .from(this.tableName)
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('byproduct_type', type)
      .eq('is_active', true);

    if (error) throw error;
  }
}
