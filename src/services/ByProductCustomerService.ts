import { BaseService } from './BaseService';
import type { ByProductCustomer } from '../types';

export class ByProductCustomerService extends BaseService<ByProductCustomer> {
  constructor() {
    super('byproduct_customers');
  }

  async create(customer: Omit<ByProductCustomer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ByProductCustomer> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...customer,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchByName(query: string): Promise<ByProductCustomer[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}
