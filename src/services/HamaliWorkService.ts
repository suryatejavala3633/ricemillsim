import { BaseService } from './BaseService';
import type { HamaliWork } from '../types';

export class HamaliWorkService extends BaseService<HamaliWork> {
  constructor() {
    super('hamali_work');
  }

  async getWorkBySeason(season: string): Promise<HamaliWork[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .order('work_date', { ascending: false });

    if (error) throw error;
    return data as HamaliWork[];
  }

  async createWorkEntry(work: Partial<HamaliWork>): Promise<HamaliWork> {
    const userId = await this.getUserId();

    const totalAmount = ((work.quantity_qtls || 0) * (work.rate_per_qtl || 0))
      + ((work.bags_count || 0) * (work.rate_per_bag || 0));

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...work,
        user_id: userId,
        total_amount: totalAmount
      })
      .select()
      .single();

    if (error) throw error;
    return data as HamaliWork;
  }

  async updateWorkEntry(id: string, updates: Partial<HamaliWork>): Promise<HamaliWork> {
    const userId = await this.getUserId();

    const { data: existing, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const quantityQtls = updates.quantity_qtls !== undefined ? updates.quantity_qtls : existing.quantity_qtls;
    const ratePerQtl = updates.rate_per_qtl !== undefined ? updates.rate_per_qtl : existing.rate_per_qtl;
    const bagsCount = updates.bags_count !== undefined ? updates.bags_count : existing.bags_count;
    const ratePerBag = updates.rate_per_bag !== undefined ? updates.rate_per_bag : existing.rate_per_bag;

    const totalAmount = (quantityQtls * ratePerQtl) + (bagsCount * ratePerBag);

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
    return data as HamaliWork;
  }

  async markAsPaid(id: string, paymentDate: string): Promise<HamaliWork> {
    return this.updateWorkEntry(id, {
      payment_status: 'paid',
      payment_date: paymentDate
    });
  }

  async getWorkerSummary(season: string, workerName: string): Promise<{
    totalWork: number;
    totalPaid: number;
    totalPending: number;
    workCount: number;
  }> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('season', season)
      .eq('worker_name', workerName);

    if (error) throw error;

    let totalWork = 0;
    let totalPaid = 0;
    let totalPending = 0;
    const workCount = data.length;

    data.forEach((entry: HamaliWork) => {
      totalWork += entry.total_amount;
      if (entry.payment_status === 'paid') {
        totalPaid += entry.total_amount;
      } else {
        totalPending += entry.total_amount;
      }
    });

    return { totalWork, totalPaid, totalPending, workCount };
  }

  async getACKHamaliCost(season: string, ackReference: string): Promise<number> {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('total_amount')
      .eq('user_id', userId)
      .eq('season', season)
      .eq('ack_reference', ackReference);

    if (error) throw error;

    return data.reduce((sum, entry) => sum + (entry.total_amount || 0), 0);
  }
}
