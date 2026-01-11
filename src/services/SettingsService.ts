import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';
import { YieldStructure, WorkingCosts } from '../types';

export interface MillSettings {
  id: string;
  user_id: string;
  mill_name: string;
  default_yields: YieldStructure;
  default_working_costs: WorkingCosts;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class SettingsService extends BaseService {
  constructor() {
    super('mill_settings');
  }

  async getUserSettings(): Promise<MillSettings | null> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as MillSettings | null;
  }

  async updateSettings(updates: Partial<MillSettings>): Promise<MillSettings> {
    const userId = await this.getUserId();
    const settings = await this.getUserSettings();

    if (settings) {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as MillSettings;
    } else {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({ ...updates, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as MillSettings;
    }
  }

  async getDefaultYields(): Promise<YieldStructure> {
    const settings = await this.getUserSettings();
    return settings?.default_yields || {
      headRice: 64,
      brokenRice: 2,
      bran: 8,
      param: 3,
      rejectionRice: 1,
      husk: 22,
    };
  }

  async getDefaultWorkingCosts(): Promise<WorkingCosts> {
    const settings = await this.getUserSettings();
    return settings?.default_working_costs || {
      electricity: 0,
      labour: 0,
      salaries: 0,
      hamali: 0,
      spares: 0,
      fciExpenses: 0,
      others: 0,
    };
  }
}

export const settingsService = new SettingsService();
