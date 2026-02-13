"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Image as ImageIcon, Tag, Info, ShieldCheck, ExternalLink, Package } from 'lucide-react';
import { Spinner } from './Spinner';

export default function ProductDetailModal({ item, isOpen, onClose, isAdmin, onRefresh }: any) {
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
      // Update Product Image
      const { error: pErr } = await supabase
        .from('products')
        .update({ image_url: editData.image_url })
        .eq('id', item.product_id);

      // Update Variant Discount
      const { error: vErr } = await supabase
        .from('product_variants')
        .update({ discount_percent: editData.discount_percent })
        .eq('id', item.id);

      if (pErr || vErr) throw pErr || vErr;

      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const originalPrice = Number(item.price_online || item.price_myr || 0);
  const discountedPrice = originalPrice * (1 - (editData.discount_percent / 100));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* Left: Product Visual */}
        <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-12 border-r border-slate-100 relative">
          <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-md md:hidden"><X/></button>
          {editData.image_url ? (
            <img src={editData.image_url} className="w-full h-auto object-contain rounded-2xl shadow-lg" alt="Product" />
          ) : (
            <div className="text-center text-slate-300">
              <Package size={120} strokeWidth={1} />
              <p className="text-xs font-bold uppercase mt-4 tracking-widest">No Image Provided</p>
            </div>
          )}
        </div>

        {/* Right: Info & Admin Panel */}
        <div className="w-full md:w-1/2 p-10 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div>
                <span className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em]">{item.products?.brands?.name}</span>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight uppercase italic">{item.products?.name}</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Part No: {item.part_number}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all hidden md:block"><X size={24}/></button>
          </div>

          <div className="flex-1 space-y-8">
             {/* Price Display */}
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Live Store Price</p>
                <div className="flex items-baseline gap-3">
                   <span className="text-3xl font-black text-slate-900 italic">RM {discountedPrice.toFixed(2)}</span>
                   {editData.discount_percent > 0 && (
                     <span className="text-lg text-slate-300 line-through font-medium">RM {originalPrice.toFixed(2)}</span>
                   )}
                </div>
             </div>

             {/* Admin Section */}
             {isAdmin && (
               <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Administrator Controls</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">External Image URL (ImgBB)</label>
                    <div className="flex gap-2">
                       <input 
                        className="flex-1 p-2.5 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.image_url}
                        onChange={e => setEditData({...editData, image_url: e.target.value})}
                        placeholder="https://i.ibb.co/..."
                       />
                       <a href="https://imgbb.com" target="_blank" className="p-2.5 bg-white border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><ExternalLink size={16}/></a>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Set Discount (%)</label>
                    <div className="flex items-center gap-4">
                       <input 
                        type="number" 
                        max="100"
                        className="w-32 p-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.discount_percent}
                        onChange={e => setEditData({...editData, discount_percent: parseFloat(e.target.value)})}
                       />
                       <span className="text-orange-600 font-bold text-xs uppercase italic">Save: RM {(originalPrice - discountedPrice).toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
                  >
                    {loading ? <Spinner size={16}/> : <Save size={16}/>} Sync Product Data
                  </button>
               </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Warehouse Position</p>
                   <p className="text-sm font-bold text-slate-700">{item.bin_location || 'A1-01'}</p>
                </div>
                <div className="border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Available Stock</p>
                   <p className="text-sm font-bold text-slate-700">{item.stock_quantity} Units</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}