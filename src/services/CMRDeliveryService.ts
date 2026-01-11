import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

export interface CMRDelivery {
  id: string;
  user_id: string;
  season: string;
  delivery_date: string;
  ack_number: string;
  destination_pool: 'fci' | 'central' | 'state';
  variety: 'raw' | 'boiled';
  cmr_quantity_qtls: number;
  paddy_consumed_qtls: number;
  vehicle_number: string;
  driver_name: string;
  delivery_status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  gate_in_status: boolean;
  gate_in_date: string | null;
  dumping_status: 'pending_ds' | 'pending_md' | 'completed' | 'none';
  notes: string;
  created_at: string;
  updated_at: string;
}

export class CMRDeliveryService extends BaseService<CMRDelivery> {
  constructor() {
    super('cmr_deliveries');
  }

  async addDelivery(data: Partial<CMRDelivery>): Promise<CMRDelivery> {
    const userId = await this.getUserId();

    const { data: delivery, error } = await supabase
      .from(this.tableName)
      .insert({
        ...data,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return delivery as CMRDelivery;
  }

  async getDeliveriesBySeason(season: string): Promise<CMRDelivery[]> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .order('delivery_date', { ascending: false });

    if (error) throw error;
    return data as CMRDelivery[];
  }

  async updateDelivery(id: string, updates: Partial<CMRDelivery>): Promise<CMRDelivery> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
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
    return data as CMRDelivery;
  }

  async updateGateInStatus(id: string, gateInStatus: boolean): Promise<void> {
    await this.updateDelivery(id, {
      gate_in_status: gateInStatus,
      gate_in_date: gateInStatus ? new Date().toISOString().split('T')[0] : null
    });
  }

  async updateDumpingStatus(id: string, dumpingStatus: CMRDelivery['dumping_status']): Promise<void> {
    await this.updateDelivery(id, { dumping_status: dumpingStatus });
  }

  async deleteDelivery(id: string): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
