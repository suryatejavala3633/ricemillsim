import { BaseService } from './BaseService';
import { MillingScenario } from '../types';

export interface CalculatorSnapshot {
  id: string;
  user_id: string;
  name: string;
  calculator_type: 'paddy_to_rice' | 'ack' | 'purchase';
  input_data: MillingScenario | Record<string, any>;
  results: Record<string, any>;
  notes?: string;
  created_at: string;
}

export class CalculatorService extends BaseService {
  constructor() {
    super('calculator_snapshots');
  }

  async saveSnapshot(
    name: string,
    calculatorType: CalculatorSnapshot['calculator_type'],
    inputData: any,
    results: any,
    notes?: string
  ): Promise<CalculatorSnapshot> {
    return this.create<CalculatorSnapshot>({
      name,
      calculator_type: calculatorType,
      input_data: inputData,
      results,
      notes,
    });
  }

  async getByType(calculatorType: CalculatorSnapshot['calculator_type']): Promise<CalculatorSnapshot[]> {
    return this.query<CalculatorSnapshot>({ calculator_type: calculatorType }, 'created_at', false);
  }

  async search(searchTerm: string): Promise<CalculatorSnapshot[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CalculatorSnapshot[];
  }
}

import { supabase } from '../lib/supabase';

export const calculatorService = new CalculatorService();
