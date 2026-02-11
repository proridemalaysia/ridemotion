"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Package, Plus, FolderPlus, Image as ImageIcon, MapPin } from 'lucide-react';
import { Spinner } from './Spinner';

export default function ProductModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    item_code: '', sku: '', brand_name: '', model_name: '', category_id: '',
    image_url: '', bin_location: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: product } = await supabase.from('products').insert([{ 
        name: `${formData.model_name} ${formData.item_code}`, 
        slug: `${formData.sku.toLowerCase()}-${Date.now()}`,
        item_code: formData.item_code, model_name: formData.model_name,
        brand_name: formData.brand_name, category_id: formData.category_id,
        image_url: formData.image_url, is_published: true 
      }]).select().single();

      await supabase.from('product_variants').insert([{
        product_id: product.id, sku: formData.sku,
        bin_location: formData.bin_location, // Added this
        position: formData.position, variant_type: formData.variant_type,
        packing_ratio: formData.packing_ratio, cost_price: formData.cost_rm,
        price_sell: formData.price_sell, price_online: formData.price_online,
        stock_quantity: formData.stock_quantity, low_stock_alert: formData.low_stock_alert,
        length_cm: formData.length_cm, width_cm: formData.width_cm, height_cm: formData.height_cm,
      }]);

      onSuccess();
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase mb-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="font-black text-slate-800 italic uppercase">Create New Part</h2>
          <button onClick={onClose}><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          <section className="grid grid-cols-6 gap-4">
             <div className="col-span-2">
                <label className={labelClass}>Part No / SKU</label>
                <input required className={inputClass} onChange={e => setFormData({...formData, sku: e.target.value})} />
             </div>
             <div className="col-span-2">
                <label className={labelClass}>Bin Location (Shelf)</label>
                <div className="relative">
                   <MapPin className="absolute left-2 top-2.5 text-slate-300" size={14}/>
                   <input className={`${inputClass} pl-8`} placeholder="e.g. A1-05" onChange={e => setFormData({...formData, bin_location: e.target.value})} />
                </div>
             </div>
             <div className="col-span-2">
                <label className={labelClass}>Stock Quantity</label>
                <input type="number" className={inputClass} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} />
             </div>
             <div className="col-span-3">
                <label className={labelClass}>Vehicle Model</label>
                <input required className={inputClass} onChange={e => setFormData({...formData, model_name: e.target.value})} />
             </div>
             <div className="col-span-3">
                <label className={labelClass}>Image URL</label>
                <input className={inputClass} placeholder="https://..." onChange={e => setFormData({...formData, image_url: e.target.value})} />
             </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClass}>Cost (RM)</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, cost_rm: parseFloat(e.target.value)})} /></div>
                <div><label className={labelClass}>Retail (RM)</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_sell: parseFloat(e.target.value)})} /></div>
                <div><label className={labelClass}>Online (RM)</label><input type="number" step="0.01" className={inputClass} onChange={e => setFormData({...formData, price_online: parseFloat(e.target.value)})} /></div>
             </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400">Cancel</button>
            <button type="submit" disabled={loading} className="px-12 py-3 bg-slate-900 text-white font-black rounded-xl flex items-center gap-2">
              {loading ? <Spinner size={18}/> : <Save size={18}/>} SAVE PRODUCT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}