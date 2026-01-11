import { BaseService } from './BaseService';
import type { ByProductSale, ByProductType, YieldAnalysis } from '../types';

export class ByProductSalesService extends BaseService<ByProductSale> {
  constructor() {
    super('byproduct_sales');
  }

  async create(sale: Omit<ByProductSale, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ByProductSale> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...sale,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSalesByType(type: ByProductType): Promise<ByProductSale[]> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('byproduct_type', type)
      .order('sale_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getYieldAnalysis(): Promise<YieldAnalysis[]> {
    const sales = await this.getAll();
    const byProductTypes: ByProductType[] = ['broken_rice', 'bran', 'param', 'rejection_rice', 'husk'];

    const analysis: YieldAnalysis[] = byProductTypes.map(type => {
      const typeSales = sales.filter(sale => sale.byproduct_type === type);
      const total_quantity = typeSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const total_acks = typeSales.reduce((sum, sale) => sum + sale.ack_count, 0);
      const avg_per_ack = total_acks > 0 ? total_quantity / total_acks : 0;

      const yield_percentage = avg_per_ack > 0 ? (avg_per_ack / 290) * 100 : 0;

      return {
        byproduct_type: type,
        total_quantity,
        total_acks,
        avg_per_ack,
        yield_percentage
      };
    });

    return analysis;
  }
}
