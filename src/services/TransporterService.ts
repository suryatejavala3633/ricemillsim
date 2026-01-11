import { BaseService } from './BaseService';
import type { Transporter } from '../types';

export class TransporterService extends BaseService<Transporter> {
  constructor() {
    super('transporters');
  }

  async getActiveTransporters(): Promise<Transporter[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Transporter[];
  }

  async createTransporter(transporter: Partial<Transporter>): Promise<Transporter> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...transporter,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data as Transporter;
  }

  async updateTransporter(id: string, updates: Partial<Transporter>): Promise<Transporter> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Transporter;
  }

  async deactivateTransporter(id: string): Promise<void> {
    await this.updateTransporter(id, { is_active: false });
  }

  async activateTransporter(id: string): Promise<void> {
    await this.updateTransporter(id, { is_active: true });
  }
}
