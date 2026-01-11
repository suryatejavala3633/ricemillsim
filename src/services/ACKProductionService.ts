import { BaseService } from './BaseService';
import type { ACKProduction } from '../types';

export class ACKProductionService extends BaseService<ACKProduction> {
  constructor() {
    super('ack_production');
  }

  async create(ack: Omit<ACKProduction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ACKProduction> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...ack,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getByACKNumber(ackNumber: string): Promise<ACKProduction | null> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('ack_number', ackNumber)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getLatestACK(): Promise<ACKProduction | null> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('production_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getACKsInRange(fromACK: string, toACK: string): Promise<ACKProduction[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('ack_number', fromACK)
      .lte('ack_number', toACK)
      .order('ack_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
