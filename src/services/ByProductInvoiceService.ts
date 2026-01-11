import { BaseService } from './BaseService';
import type { ByProductInvoice, ByProductInvoiceItem, InvoiceWithDetails, InvoiceStatus } from '../types';

export class ByProductInvoiceService extends BaseService<ByProductInvoice> {
  constructor() {
    super('byproduct_invoices');
  }

  async create(invoice: Omit<ByProductInvoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>, items: Omit<ByProductInvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]): Promise<ByProductInvoice> {
    const userId = await this.getUserId();

    const { data: invoiceData, error: invoiceError } = await this.supabase
      .from(this.tableName)
      .insert({
        ...invoice,
        user_id: userId
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id
      }));

      const { error: itemsError } = await this.supabase
        .from('byproduct_invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return invoiceData;
  }

  async getInvoiceWithDetails(invoiceId: string): Promise<InvoiceWithDetails | null> {
    const userId = await this.getUserId();

    const { data: invoice, error: invoiceError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoice) return null;

    const { data: items, error: itemsError } = await this.supabase
      .from('byproduct_invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    const { data: payments, error: paymentsError } = await this.supabase
      .from('byproduct_payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;

    const totalPaid = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
    const balance = invoice.total_amount - totalPaid;

    return {
      ...invoice,
      items: items || [],
      payments: payments || [],
      balance
    };
  }

  async getAllWithDetails(): Promise<InvoiceWithDetails[]> {
    const invoices = await this.getAll();
    const invoicesWithDetails = await Promise.all(
      invoices.map(invoice => this.getInvoiceWithDetails(invoice.id))
    );
    return invoicesWithDetails.filter((inv): inv is InvoiceWithDetails => inv !== null);
  }

  async updateStatus(invoiceId: string, status: InvoiceStatus): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await this.supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getNextInvoiceNumber(prefix: string = 'INV'): Promise<string> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('invoice_number')
      .eq('user_id', userId)
      .like('invoice_number', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return `${prefix}-001`;
    }

    const match = data.invoice_number.match(/(\d+)$/);
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
    }

    return `${prefix}-001`;
  }

  async getByStatus(status: InvoiceStatus): Promise<ByProductInvoice[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
