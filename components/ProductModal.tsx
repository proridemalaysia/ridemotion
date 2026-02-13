"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, FolderPlus, Loader2 } from 'lucide-react';
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

  // State mapped to your CSV Headers for the Flat Table structure
  const [formData, setFormData] = useState({
    item_code: '',
    part_number: '',
    brand: '',
    model_name: '',
    category_id: '',
    position: '',
    type: '', // This is the "Var (Type)" field
    packing_ratio: 1,
    buy_usd: 0,
    cost_rm: 0,
    price_myr: 0, // This is the "SELL" price
    price_online: 0,
    price_proposal: 0,
    stock_quantity: 0,
    min_stock_level: 5, // This is the "Low Stock Alert"
    ctn_qty: 1, // Items per Master Carton
    ctn_len: 0,
    ctn_wid: 0,
    ctn_height: 0
  });

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  const handleQuickAddCategory = async () => {
    const name = prompt("Enter new category name (e.g. Engine Parts):");
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
    if (!formData.category_id) return alert("Please select a category first.");
    setLoading(true);

    try {
      // 1. Get current user for logging
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Prepare search_text for optimized database queries
      const searchText = `${formData.brand} ${formData.model_name} ${formData.part_number} ${formData.item_code} ${formData.position} ${formData.type}`.toLowerCase();
      
      // 3. Insert the new record into the Flat Table
      const { error: insertError } = await supabase.from('products_flat').insert([{
        ...formData,
        name: `${formData.model_name} ${formData.type}`.trim(),
        search_text: searchText,
        is_published: true,
        is_archived: false
      }]);

      if (insertError) throw insertError;

      // 4. LOG THE ACTION INTENT (Step 3 Requirement)
      // This records WHO did it and WHAT they did in the Audit Trail
      await supabase.from('admin_logs').insert([{
        user_id: user?.id,
        user_email: user?.email,
        action: 'INSERT',
        entity: 'products_flat',
        details: `Staff created new inventory record: SKU ${formData.part_number} (${formData.brand} ${formData.model_name})`
      }]);

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Styling Constants matching your High-Density design
  const sectionTitle = "text-[13px] font-bold text-slate-600 mb-4 border-b border-slate-100 pb-2 uppercase tracking-tight";
  const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider";
  const inputClass = "w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white transition-all font-medium";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest italic">Inventory Part Registration</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full active:scale-90 transition-all text-slate-400">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
          
          {/* 1. IDENTITY SECTION */}
          <section>
            <h3 className={sectionTitle}>1. Identity (CSV Ready)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Item Code *</label>
                <input required className={inputClass} placeholder="e.g. SAFST" onChange={e => setFormData({...formData, item_code: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Part No / SKU *</label>
                <input required className={inputClass} placeholder="e.g. 341144" onChange={e => setFormData({...formData, part_number: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Brand *</label>
                <input required className={inputClass} placeholder="Type or select..." onChange={e => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Model Name *</label>
                <input required className={inputClass} placeholder="e.g. SAGA/ISWARA" onChange={e => setFormData({...formData, model_name: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <div className="flex gap-2">
                    <select required className={`${inputClass} flex-1`} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button 
                        type="button" 
                        onClick={handleQuickAddCategory} 
                        disabled={isAddingCategory}
                        className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                        title="Add Category"
                    >
                        {isAddingCategory ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
                    </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. VARIATION SECTION */}
          <section>
            <h3 className={sectionTitle}>2. Variation & Position</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Position</label>
                <input className={inputClass} placeholder="e.g. FRONT LH" onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Var (Type)</label>
                <input className={inputClass} placeholder="e.g. STD, HDUTY, PERF" onChange={e => setFormData({...formData, type: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Packing Ratio</label>
                <input type="number" className={inputClass} value={formData.packing_ratio} onChange={e => setFormData({...formData, packing_ratio: parseInt(e.target.value)})} />
                <p className="text-[9px] text-slate-400 mt-1 font-medium tracking-tight">Enter 6 for Oil Box, 1 for Shocks.</p>
              </div>
            </div>
          </section>

          {/* 3. PRICING SECTION */}
          <section>
            <h3 className={sectionTitle}>3. Pricing Structure</h3>
            <div className="bg-slate-50 p-5 rounded-xl grid grid-cols-5 gap-4 border border-slate-100">
               <div className="col-span-2 grid grid-cols-2 gap-3 border-r border-slate-200 pr-4">
                  <p className="col-span-2 text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest italic">Cost (Reference)</p>
                  <div>
                    <label className={labelClass}>BUY (USD)</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, buy_usd: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className={labelClass}>COST (RM)</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, cost_rm: parseFloat(e.target.value)})} />
                  </div>
               </div>
               <div className="col-span-3 grid grid-cols-3 gap-3">
                  <p className="col-span-3 text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest italic">Selling Prices (RM)</p>
                  <div>
                    <label className={labelClass}>SELL (POS)</label>
                    <input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_myr: parseFloat(e.target.value)})} />
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

          {/* 4. STOCK SECTION */}
          <section>
            <h3 className={sectionTitle}>4. Initial Stock</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Current Stock (Base Units)</label>
                <input type="number" className={inputClass} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>Low Stock Alert</label>
                <input type="number" className={inputClass} value={formData.min_stock_level} onChange={e => setFormData({...formData, min_stock_level: parseInt(e.target.value)})} />
              </div>
            </div>
          </section>

          {/* 5. CBM SECTION */}
          <section className="bg-blue-50/40 border border-blue-100 p-5 rounded-xl">
            <h3 className="text-[13px] font-bold text-blue-700 mb-4 flex items-center gap-2 uppercase tracking-tight">
              5. Packaging & CBM Analysis (Optional)
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Qty Per Master Carton</label>
                <input type="number" className={inputClass} value={formData.ctn_qty} onChange={e => setFormData({...formData, ctn_qty: parseInt(e.target.value)})} />
                <p className="text-[9px] text-blue-400 mt-1 font-bold italic tracking-tighter">e.g. 10 Shocks / Ctn</p>
              </div>
              <div>
                <label className={labelClass}>Length (cm)</label>
                <input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, ctn_len: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>Width (cm)</label>
                <input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, ctn_wid: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, ctn_height: parseFloat(e.target.value)})} />
              </div>
            </div>
          </section>

          {/* Footer Action */}
          <div className="pt-4 border-t">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.96] shadow-xl shadow-blue-200 uppercase tracking-widest text-[11px]"
            >
              {loading ? <Spinner size={20} /> : <Save size={20} />}
              {loading ? 'Committing to Ledger...' : 'Finalize & Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}