"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, ShieldCheck, ExternalLink, Package, Tag, Percent } from 'lucide-react';
import { Spinner } from './Spinner';

interface ProductDetailModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function ProductDetailModal({ item, isOpen, onClose, isAdmin, onRefresh }: ProductDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    image_url: '',
    discount_percent: 0,
  });

  useEffect(() => {
    if (item) {
      setEditData({
        image_url: item.products?.image_url || '',
        discount_percent: item.discount_percent || 0
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error: pErr } = await supabase
        .from('products')
        .update({ image_url: editData.image_url })
        .eq('id', item.product_id);

      const { error: vErr } = await supabase
        .from('product_variants')
        .update({ discount_percent: editData.discount_percent })
        .eq('id', item.id);

      if (pErr || vErr) throw pErr || vErr;
      onRefresh();
      onClose();
    } catch (err: any) {
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const originalPrice = Number(item.price_online || item.price_myr || 0);
  const discountedPrice = originalPrice * (1 - (editData.discount_percent / 100));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-8 border-r border-slate-100 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md md:hidden active:scale-95 transition-all text-slate-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
          {editData.image_url ? (
            <img src={editData.image_url} className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-sm" alt="Product" />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <Package size={100} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase mt-4 tracking-[0.2em]">No Image Assigned</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
             <div className="space-y-1">
                <span className="text-blue-600 text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                    {item.products?.brands?.name || 'GENUINE'}
                </span>
                {/* CHANGED: Category UPPERCASE, no brackets + Name */}
                <h2 className="text-xl font-bold text-slate-800 leading-snug">
                    <span className="text-slate-400 mr-2 uppercase tracking-tighter">{item.products?.category}</span> 
                    {item.products?.name}
                </h2>
                {/* CHANGED: SKU to Item Code */}
                <p className="text-slate-500 text-xs font-mono font-bold uppercase tracking-wider italic">
                    Item Code: {item.item_code}
                </p>
             </div>
             <button 
               onClick={onClose} 
               className="p-2 hover:bg-slate-100 rounded-full transition-all hidden md:block active:scale-95 text-slate-400 hover:text-red-500"
             >
               <X size={24} />
             </button>
          </div>

          <div className="flex-1 space-y-8">
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Store Price</p>
                <div className="flex items-center gap-3">
                   <span className="text-3xl font-bold text-slate-900 tracking-tighter italic">RM {discountedPrice.toFixed(2)}</span>
                   {editData.discount_percent > 0 && <span className="text-sm text-slate-400 line-through font-medium">RM {originalPrice.toFixed(2)}</span>}
                </div>
                {editData.discount_percent > 0 && <div className="inline-flex items-center gap-1 mt-2 text-red-600 font-bold text-xs uppercase italic"><Tag size={12} /> {Math.round(editData.discount_percent)}% OFF applied</div>}
             </div>

             {isAdmin && (
               <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><ShieldCheck size={18} className="text-blue-600" /><span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Admin Control</span></div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">ImgBB Image Link</label>
                    <div className="flex gap-2">
                       <input className="flex-1 p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" value={editData.image_url} onChange={e => setEditData({...editData, image_url: e.target.value})} placeholder="Paste direct link here..." />
                       <a href="https://imgbb.com" target="_blank" className="p-2.5 bg-white border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center justify-center"><ExternalLink size={16}/></a>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Individual Item Discount (%)</label>
                    <div className="flex items-center gap-3">
                       <div className="relative flex-1 max-w-[140px]">
                          <input type="number" max="100" className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 pr-10 shadow-inner" value={editData.discount_percent} onChange={e => setEditData({...editData, discount_percent: parseFloat(e.target.value) || 0})} />
                          <div className="absolute right-3 top-2.5 text-blue-300"><Percent size={16}/></div>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdate} 
                    disabled={loading} 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {loading ? <Spinner size={16}/> : <Save size={16}/>} 
                    {loading ? 'Saving...' : 'Sync Product Data'}
                  </button>
               </div>
             )}

             <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bin Location</p>
                   <p className="text-sm font-bold text-slate-700 uppercase italic">{item.bin_location || 'Not Set'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Stock</p>
                   <p className={`text-sm font-bold ${item.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.stock_quantity} Units</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}