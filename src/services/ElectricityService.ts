import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';
import type { ElectricityReading, PowerFactorCalculation } from '../types';

export class ElectricityService extends BaseService {
  constructor() {
    super('electricity_readings');
  }

  async getAll(): Promise<ElectricityReading[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', await this.getUserId())
      .order('reading_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getLatestBillReading(): Promise<ElectricityReading | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', await this.getUserId())
      .eq('is_bill_reading', true)
      .order('reading_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getReadingsWithPF(): Promise<PowerFactorCalculation[]> {
    const readings = await this.getAll();
    const calculations: PowerFactorCalculation[] = [];

    const lastBillReading = readings.find(r => r.is_bill_reading);

    for (let i = 0; i < readings.length; i++) {
      const current = readings[i];
      const previous = readings[i + 1];

      let kwh_diff = 0;
      let kvah_diff = 0;
      let power_factor = 0;
      let days_diff = 0;

      if (previous) {
        kwh_diff = current.kwh_reading - previous.kwh_reading;
        kvah_diff = current.kvah_reading - previous.kvah_reading;
        power_factor = kvah_diff > 0 ? kwh_diff / kvah_diff : 0;

        const currentDate = new Date(current.reading_date);
        const previousDate = new Date(previous.reading_date);
        days_diff = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      let monthly_kwh_diff = 0;
      let monthly_kvah_diff = 0;
      let monthly_power_factor = 0;
      let monthly_days_diff = 0;

      if (lastBillReading && current.id !== lastBillReading.id) {
        monthly_kwh_diff = current.kwh_reading - lastBillReading.kwh_reading;
        monthly_kvah_diff = current.kvah_reading - lastBillReading.kvah_reading;
        monthly_power_factor = monthly_kvah_diff > 0 ? monthly_kwh_diff / monthly_kvah_diff : 0;

        const currentDate = new Date(current.reading_date);
        const billDate = new Date(lastBillReading.reading_date);
        monthly_days_diff = Math.round((currentDate.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      calculations.push({
        reading: current,
        kwh_diff,
        kvah_diff,
        power_factor,
        days_diff,
        previous_reading: previous,
        monthly_kwh_diff,
        monthly_kvah_diff,
        monthly_power_factor,
        monthly_days_diff,
        bill_reading: lastBillReading
      });
    }

    return calculations;
  }

  async create(reading: Omit<ElectricityReading, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ElectricityReading> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...reading,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<ElectricityReading>): Promise<ElectricityReading> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .eq('user_id', await this.getUserId())
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', await this.getUserId());

    if (error) throw error;
  }
}
