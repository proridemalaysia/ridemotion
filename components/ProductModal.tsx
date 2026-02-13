"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { Spinner } from './Spinner';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ isOpen, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [formData, setFormData] = useState({
    item_code: '', sku: '', brand_name: '', model_name: '', category_id: '',
    position: '', variant_type: '', packing_ratio: 1,
    buy_usd: 0, cost_rm: 0, price_sell: 0, price_online: 0, price_proposal: 0,
    stock_quantity: 0, low_stock_alert: 5,
    items_per_carton: 1, length_cm: 0, width_cm: 0, height_cm: 0
  });

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  const handleQuickAddCategory = async () => {
    const name = prompt("Enter new category name (e.g., Engine Parts):");
    if (!name) return;

    setIsAddingCategory(true);
    const slug = name.toLowerCase().replace(/ /g, '-');
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, slug }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh list and auto-select the new one
      await fetchCategories();
      setFormData(prev => ({ ...prev, category_id: data.id }));
    } catch (err: any) {
      alert("Error adding category: " + err.message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) return alert("Please select a category");
    setLoading(true);

    try {
      // 1. Insert Product
      const { data: product, error: pError } = await supabase.from('products').insert([{ 
        name: `${formData.model_name} - ${formData.variant_type}`,
        item_code: formData.item_code,
        model_name: formData.model_name,
        brand_name: formData.brand_name,
        category_id: formData.category_id,
        slug: `${formData.sku.toLowerCase()}-${Date.now()}`,
        is_published: true 
      }]).select().single();

      if (pError) throw pError;

      // 2. Insert Variant
      const { error: vError } = await supabase.from('product_variants').insert([{
        product_id: product.id,
        sku: formData.sku,
        position: formData.position,
        variant_type: formData.variant_type,
        packing_ratio: formData.packing_ratio,
        buy_usd: formData.buy_usd,
        cost_price: formData.cost_rm,
        price_sell: formData.price_sell,
        price_online: formData.price_online,
        price_proposal: formData.price_proposal,
        stock_quantity: formData.stock_quantity,
        low_stock_alert: formData.low_stock_alert,
        items_per_carton: formData.items_per_carton,
        length_cm: formData.length_cm,
        width_cm: formData.width_cm,
        height_cm: formData.height_cm,
      }]);

      if (vError) throw vError;
      onSuccess();
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const sectionTitle = "text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2";
  const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1";
  const inputClass = "w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white transition-all";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700">Add New Inventory Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full active:scale-90 transition-all">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
          
          {/* 1. Identity */}
          <section>
            <h3 className={sectionTitle}>1. Identity (From PDF)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Item Code *</label>
                <input required className={inputClass} placeholder="e.g. SAFST" onChange={e => setFormData({...formData, item_code: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Part No / SKU *</label>
                <input required className={inputClass} placeholder="e.g. 341144" onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Brand *</label>
                <input required className={inputClass} placeholder="Type or select..." onChange={e => setFormData({...formData, brand_name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Model Name *</label>
                <input required className={inputClass} placeholder="e.g. SAGA/ISWARA" onChange={e => setFormData({...formData, model_name: e.target.value})} />
              </div>
              
              {/* CATEGORY SELECT WITH QUICK ADD */}
              <div>
                <label className={labelClass}>Category *</label>
                <div className="flex gap-2">
                    <select 
                        required 
                        className={`${inputClass} flex-1`}
                        value={formData.category_id}
                        onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button 
                        type="button"
                        onClick={handleQuickAddCategory}
                        disabled={isAddingCategory}
                        className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="Add New Category"
                    >
                        {isAddingCategory ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
                    </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Variation & Position */}
          <section>
            <h3 className={sectionTitle}>2. Variation & Position</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Position</label>
                <input className={inputClass} placeholder="e.g. FRONT LH" onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Var (Type)</label>
                <input className={inputClass} placeholder="e.g. STD, HDUTY, PERF" onChange={e => setFormData({...formData, variant_type: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Packing Ratio (Important!)</label>
                <input type="number" className={inputClass} value={formData.packing_ratio} onChange={e => setFormData({...formData, packing_ratio: parseInt(e.target.value)})} />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Enter 6 for Oil Box, 1 for Shocks.</p>
              </div>
            </div>
          </section>

          {/* 3. Pricing Structure */}
          <section>
            <h3 className={sectionTitle}>3. Pricing Structure</h3>
            <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-5 gap-4">
               <div className="col-span-2 grid grid-cols-2 gap-2 border-r border-slate-200 pr-4">
                  <p className="col-span-2 text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Cost (Reference)</p>
                  <div>
                    <label className={labelClass}>BUY (USD)</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, buy_usd: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className={labelClass}>COST (RM)</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, cost_rm: parseFloat(e.target.value)})} />
                  </div>
               </div>
               <div className="col-span-3 grid grid-cols-3 gap-2">
                  <p className="col-span-3 text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Selling Prices (RM)</p>
                  <div>
                    <label className={labelClass}>SELL</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_sell: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className={labelClass}>ONLINE</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_online: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className={labelClass}>PROPOSAL</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_proposal: parseFloat(e.target.value)})} />
                  </div>
               </div>
            </div>
          </section>

          {/* 4. Initial Stock */}
          <section>
            <h3 className={sectionTitle}>4. Initial Stock</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Current Stock (Base Units)</label>
                <input type="number" className={inputClass} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>Low Stock Alert</label>
                <input type="number" className={inputClass} value={formData.low_stock_alert} onChange={e => setFormData({...formData, low_stock_alert: parseInt(e.target.value)})} />
              </div>
            </div>
          </section>

          {/* 5. Packaging & CBM Analysis */}
          <section className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg">
            <h3 className="text-[13px] font-bold text-blue-700 mb-4 flex items-center gap-2">
              5. Packaging & CBM Analysis (Optional)
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Items per Master Carton</label>
                <input type="number" className={inputClass} value={formData.items_per_carton} onChange={e => setFormData({...formData, items_per_carton: parseInt(e.target.value)})} />
                <p className="text-[10px] text-blue-400 mt-1 font-medium italic">e.g. 10 Shocks / Ctn</p>
              </div>
              <div>
                <label className={labelClass}>Length (cm)</label>
                <input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, length_cm: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>Width (cm)</label>
                <input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, width_cm: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, height_cm: parseFloat(e.target.value)})} />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-3 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-100"
            >
              {loading ? <Spinner size={18} /> : <Save size={18} />}
              {loading ? 'SAVING PRODUCT...' : 'SAVE ITEM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}