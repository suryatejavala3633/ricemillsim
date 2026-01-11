import { BaseService } from './BaseService';
import type { SupervisorWages } from '../types';

export class SupervisorWagesService extends BaseService<SupervisorWages> {
  constructor() {
    super('supervisor_wages');
  }

  async getWagesBySeason(season: string): Promise<SupervisorWages[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data as SupervisorWages[];
  }

  async createWageEntry(wages: Partial<SupervisorWages>): Promise<SupervisorWages> {
    const userId = await this.getUserId();

    const totalAmount = (wages.base_salary || 0)
      + (wages.ack_bonus || 0)
      + (wages.overtime_amount || 0)
      - (wages.deductions || 0);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...wages,
        user_id: userId,
        total_amount: totalAmount
      })
      .select()
      .single();

    if (error) throw error;
    return data as SupervisorWages;
  }

  async updateWageEntry(id: string, updates: Partial<SupervisorWages>): Promise<SupervisorWages> {
    const userId = await this.getUserId();

    const { data: existing, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const baseSalary = updates.base_salary !== undefined ? updates.base_salary : existing.base_salary;
    const ackBonus = updates.ack_bonus !== undefined ? updates.ack_bonus : existing.ack_bonus;
    const overtimeAmount = updates.overtime_amount !== undefined ? updates.overtime_amount : existing.overtime_amount;
    const deductions = updates.deductions !== undefined ? updates.deductions : existing.deductions;

    const totalAmount = baseSalary + ackBonus + overtimeAmount - deductions;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...updates,
        total_amount: totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as SupervisorWages;
  }

  async markAsPaid(id: string): Promise<SupervisorWages> {
    return this.updateWageEntry(id, { payment_status: 'paid' });
  }

  async getEmployeeSummary(season: string, employeeName: string): Promise<{
    totalPaid: number;
    totalPending: number;
    ackCount: number;
  }> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .eq('employee_name', employeeName);

    if (error) throw error;

    let totalPaid = 0;
    let totalPending = 0;
    let ackCount = 0;

    data.forEach((entry: SupervisorWages) => {
      if (entry.payment_status === 'paid') {
        totalPaid += entry.total_amount;
      } else {
        totalPending += entry.total_amount;
      }
      ackCount += entry.acks_completed || 0;
    });

    return { totalPaid, totalPending, ackCount };
  }
}
