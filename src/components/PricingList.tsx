import { useState, useEffect } from 'react';
import { supabase, PricingItemWithDetails, ItemCategory, PriceRecord } from '../lib/supabase';
import { TrendingUp, TrendingDown, Plus, Edit2, History, Filter, DollarSign, Package, Save, X } from 'lucide-react';

export default function PricingList() {
  const [items, setItems] = useState<PricingItemWithDetails[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [priceFormData, setPriceFormData] = useState({
    purchase_price: 0,
    sale_price: 0,
    effective_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesResult, itemsResult] = await Promise.all([
        supabase.from('item_categories').select('*').order('display_order'),
        supabase.from('pricing_items').select(`
          *,
          category:item_categories(*)
        `).eq('is_active', true).order('name')
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (itemsResult.data) {
        const itemsWithPrices = await Promise.all(
          itemsResult.data.map(async (item) => {
            const priceResult = await supabase
              .from('price_records')
              .select('*')
              .eq('item_id', item.id)
              .eq('is_current', true)
              .maybeSingle();

            return {
              ...item,
              current_price: priceResult.data || undefined
            };
          })
        );
        setItems(itemsWithPrices);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (item: PricingItemWithDetails) => {
    setEditingItem(item.id);
    setPriceFormData({
      purchase_price: item.current_price?.purchase_price || 0,
      sale_price: item.current_price?.sale_price || 0,
      effective_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleSavePrice = async (itemId: string) => {
    try {
      await supabase
        .from('price_records')
        .update({ is_current: false })
        .eq('item_id', itemId)
        .eq('is_current', true);

      const { error } = await supabase.from('price_records').insert({
        item_id: itemId,
        purchase_price: priceFormData.purchase_price,
        sale_price: priceFormData.sale_price,
        effective_date: priceFormData.effective_date,
        notes: priceFormData.notes,
        is_current: true
      });

      if (error) throw error;

      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Failed to save price. Please try again.');
    }
  };

  const handleShowHistory = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('price_records')
        .select('*')
        .eq('item_id', itemId)
        .order('effective_date', { ascending: false });

      if (error) throw error;

      setPriceHistory(data || []);
      setShowHistory(itemId);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category_id === selectedCategory);

  const stats = {
    totalItems: items.length,
    purchaseItems: items.filter(i => i.item_type === 'purchase' || i.item_type === 'both').length,
    saleItems: items.filter(i => i.item_type === 'sale' || i.item_type === 'both').length,
    avgMargin: items
      .filter(i => i.current_price && i.current_price.margin_percent > 0)
      .reduce((sum, i) => sum + (i.current_price?.margin_percent || 0), 0) /
      items.filter(i => i.current_price && i.current_price.margin_percent > 0).length || 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyan-400 text-xl">Loading pricing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign size={32} />
          <div>
            <h2 className="text-3xl font-bold">Price Management</h2>
            <p className="text-blue-100">Track and manage purchase & sale prices with complete history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Total Items</span>
              <Package size={20} className="text-blue-200" />
            </div>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Purchase Items</span>
              <TrendingDown size={20} className="text-red-300" />
            </div>
            <div className="text-2xl font-bold">{stats.purchaseItems}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Sale Items</span>
              <TrendingUp size={20} className="text-green-300" />
            </div>
            <div className="text-2xl font-bold">{stats.saleItems}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Avg. Margin</span>
              <DollarSign size={20} className="text-yellow-300" />
            </div>
            <div className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter size={24} className="text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Filter by Category</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === category.id
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {category.name} ({items.filter(i => i.category_id === category.id).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Item</th>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold">Unit</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-right font-semibold">Purchase Price</th>
                <th className="px-6 py-4 text-right font-semibold">Sale Price</th>
                <th className="px-6 py-4 text-right font-semibold">Margin</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-900/50'
                  } hover:bg-slate-700/50 transition-colors`}
                >
                  {editingItem === item.id ? (
                    <>
                      <td colSpan={8} className="px-6 py-4">
                        <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                          <h4 className="text-lg font-bold text-white mb-4">Edit Price: {item.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {(item.item_type === 'purchase' || item.item_type === 'both') && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                  Purchase Price (₹/{item.unit})
                                </label>
                                <input
                                  type="number"
                                  value={priceFormData.purchase_price}
                                  onChange={(e) => setPriceFormData({
                                    ...priceFormData,
                                    purchase_price: parseFloat(e.target.value) || 0
                                  })}
                                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                                  step="0.01"
                                />
                              </div>
                            )}
                            {(item.item_type === 'sale' || item.item_type === 'both') && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                  Sale Price (₹/{item.unit})
                                </label>
                                <input
                                  type="number"
                                  value={priceFormData.sale_price}
                                  onChange={(e) => setPriceFormData({
                                    ...priceFormData,
                                    sale_price: parseFloat(e.target.value) || 0
                                  })}
                                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                                  step="0.01"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Effective Date
                              </label>
                              <input
                                type="date"
                                value={priceFormData.effective_date}
                                onChange={(e) => setPriceFormData({
                                  ...priceFormData,
                                  effective_date: e.target.value
                                })}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Notes
                              </label>
                              <input
                                type="text"
                                value={priceFormData.notes}
                                onChange={(e) => setPriceFormData({
                                  ...priceFormData,
                                  notes: e.target.value
                                })}
                                placeholder="Price change notes"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => handleSavePrice(item.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save size={16} />
                              Save Price
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.code}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.item_type === 'purchase'
                            ? 'bg-red-500/20 text-red-300'
                            : item.item_type === 'sale'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.item_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300 font-mono">
                        {item.current_price?.purchase_price
                          ? `₹${item.current_price.purchase_price.toLocaleString('en-IN')}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300 font-mono">
                        {item.current_price?.sale_price
                          ? `₹${item.current_price.sale_price.toLocaleString('en-IN')}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.current_price?.margin_percent ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-semibold ${
                              item.current_price.margin_percent > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {item.current_price.margin_percent.toFixed(2)}%
                            </span>
                            <span className="text-xs text-gray-400">
                              (₹{item.current_price.margin_amount.toFixed(2)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditPrice(item)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Edit Price"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleShowHistory(item.id)}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            title="View History"
                          >
                            <History size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={28} />
                <div>
                  <h3 className="text-2xl font-bold text-white">Price History</h3>
                  <p className="text-purple-100">
                    {items.find(i => i.id === showHistory)?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {priceHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No price history available
                </div>
              ) : (
                <div className="space-y-4">
                  {priceHistory.map((record, index) => (
                    <div
                      key={record.id}
                      className={`bg-slate-700 rounded-xl p-4 border ${
                        record.is_current ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{priceHistory.length - index}</span>
                          {record.is_current && (
                            <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Effective Date</div>
                          <div className="font-semibold text-white">
                            {new Date(record.effective_date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Purchase Price</div>
                          <div className="text-lg font-bold text-white">
                            ₹{record.purchase_price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Sale Price</div>
                          <div className="text-lg font-bold text-white">
                            ₹{record.sale_price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Margin Amount</div>
                          <div className={`text-lg font-bold ${
                            record.margin_amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ₹{record.margin_amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Margin %</div>
                          <div className={`text-lg font-bold ${
                            record.margin_percent > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {record.margin_percent.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="text-xs text-gray-400 mb-1">Notes</div>
                          <div className="text-sm text-gray-300">{record.notes}</div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between text-xs text-gray-400">
                        <span>Created: {new Date(record.created_at).toLocaleString('en-IN')}</span>
                        <span>By: {record.created_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
