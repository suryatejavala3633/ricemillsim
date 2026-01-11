import { BaseService } from './BaseService';
import type { ByProductPayment } from '../types';

export class ByProductPaymentService extends BaseService<ByProductPayment> {
  constructor() {
    super('byproduct_payments');
  }

  async create(payment: Omit<ByProductPayment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ByProductPayment> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...payment,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getByInvoice(invoiceId: string): Promise<ByProductPayment[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTotalPaid(invoiceId: string): Promise<number> {
    const payments = await this.getByInvoice(invoiceId);
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
