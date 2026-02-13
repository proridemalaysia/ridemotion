"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, FolderPlus, Loader2 } from 'lucide-react';
import { Spinner } from './Spinner';

export default function ProductModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    item_code: '', part_number: '', brand: '', model_name: '', category_id: '',
    type: '', price_myr: 0, price_online: 0, price_proposal: 0,
    cost_rm: 0, cost_usd: 0, stock_quantity: 0, min_stock_level: 5,
    ctn_qty: 1, ctn_len: 0, ctn_wid: 0, ctn_height: 0, name: ''
  });

  useEffect(() => { if (isOpen) fetchCategories(); }, [isOpen]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('products_flat').insert([{
        ...formData,
        search_text: `${formData.part_number} ${formData.item_code} ${formData.brand} ${formData.model_name}`,
        name: `${formData.model_name} Part` // Auto-generate if empty
      }]);
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const sectionTitle = "text-[12px] font-bold text-slate-700 mb-4 border-b pb-2 uppercase tracking-widest";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase mb-1";
  const inputClass = "w-full p-2 border border-slate-200 rounded text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700 uppercase tracking-tighter italic">Create Inventory Record</h2>
          <button onClick={onClose} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full active:scale-90 transition-all"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
          <section>
            <h3 className={sectionTitle}>1. Identity (CSV Ready)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>Item Code</label><input required className={inputClass} onChange={e => setFormData({...formData, item_code: e.target.value})} /></div>
              <div><label className={labelClass}>Part Number / SKU</label><input required className={inputClass} onChange={e => setFormData({...formData, part_number: e.target.value})} /></div>
              <div><label className={labelClass}>Brand</label><input required className={inputClass} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
              <div className="col-span-2"><label className={labelClass}>Model Name</label><input required className={inputClass} onChange={e => setFormData({...formData, model_name: e.target.value})} /></div>
              <div><label className={labelClass}>Category</label>
                <select required className={inputClass} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>2. Pricing & Costing</h3>
            <div className="grid grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl">
               <div><label className={labelClass}>Cost USD</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, cost_usd: parseFloat(e.target.value)})} /></div>
               <div><label className={labelClass}>Cost RM</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, cost_rm: parseFloat(e.target.value)})} /></div>
               <div><label className={labelClass}>Sell RM</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_myr: parseFloat(e.target.value)})} /></div>
               <div><label className={labelClass}>Online RM</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_online: parseFloat(e.target.value)})} /></div>
               <div><label className={labelClass}>Prop RM</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_proposal: parseFloat(e.target.value)})} /></div>
            </div>
          </section>

          <div className="pt-6 border-t">
            <button type="submit" disabled={loading} className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-100 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18}/>} Commit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}