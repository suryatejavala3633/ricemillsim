import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface FCIDelivery {
  id: string;
  user_id: string;
  production_batch_id?: string;
  ack_no: string;
  delivery_date: string;
  quantity: number;
  rice_type: 'raw' | 'boiled';
  status: 'pending' | 'delivered' | 'acknowledged' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class FCIService extends BaseService {
  constructor() {
    super('fci_deliveries');
  }

  async getByACKNo(ackNo: string): Promise<FCIDelivery | null> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('ack_no', ackNo)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as FCIDelivery | null;
  }

  async getByDateRange(startDate: string, endDate: string): Promise<FCIDelivery[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('delivery_date', startDate)
      .lte('delivery_date', endDate)
      .order('delivery_date', { ascending: false });

    if (error) throw error;
    return data as FCIDelivery[];
  }

  async getByStatus(status: FCIDelivery['status']): Promise<FCIDelivery[]> {
    return this.query<FCIDelivery>({ status }, 'delivery_date', false);
  }

  async getByBatch(batchId: string): Promise<FCIDelivery[]> {
    return this.query<FCIDelivery>({ production_batch_id: batchId }, 'delivery_date', false);
  }

  async generateACKNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const deliveries = await this.getByDateRange(
      date.toISOString().split('T')[0],
      date.toISOString().split('T')[0]
    );
    const sequence = (deliveries.length + 1).toString().padStart(4, '0');
    return `ACK-${dateStr}-${sequence}`;
  }
}

export const fciService = new FCIService();
