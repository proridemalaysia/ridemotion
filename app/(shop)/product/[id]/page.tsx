"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, Star, CheckCircle2, Package, ArrowLeft, 
  Settings, Save, ImageIcon, ExternalLink, Percent, ShieldCheck, Tag 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  
  // Selection States
  const [selectedBundle, setSelectedBundle] = useState<'front' | 'rear' | 'full'>('full');
  const [editData, setEditData] = useState({ image_url: '', discount_percent: 0 });

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Check Admin Role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(profile?.role === 'admin' || profile?.role === 'staff');
      }

      // 2. Fetch Product & All its Variants
      const { data: prodData } = await supabase.from('products').select('*, brands(name)').eq('id', id).single();
      const { data: varData } = await supabase.from('product_variants').select('*').eq('product_id', id);

      if (prodData) {
        setProduct(prodData);
        setEditData({ 
          image_url: prodData.image_url || '', 
          discount_percent: varData?.[0]?.discount_percent || 0 
        });
      }
      if (varData) setVariants(varData);
      
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  // --- BUNDLE CALCULATION LOGIC ---
  const bundlePricing = useMemo(() => {
    const frontParts = variants.filter(v => v.position?.toUpperCase().includes('FRONT'));
    const rearParts = variants.filter(v => v.position?.toUpperCase().includes('REAR'));

    const getPrice = (parts: any[]) => {
      let total = 0;
      // If we have LH and RH, sum them. If only 1 part exists, multiply x2.
      if (parts.length === 2) {
        total = Number(parts[0].price_online || parts[0].price_myr) + Number(parts[1].price_online || parts[1].price_myr);
      } else if (parts.length === 1) {
        total = Number(parts[0].price_online || parts[0].price_myr) * 2;
      }
      return total;
    };

    const fPrice = getPrice(frontParts);
    const rPrice = getPrice(rearParts);
    const fullPrice = fPrice + rPrice;

    return {
      front: fPrice,
      rear: rPrice,
      full: fullPrice,
      hasFront: fPrice > 0,
      hasRear: rPrice > 0
    };
  }, [variants]);

  const currentPrice = bundlePricing[selectedBundle];
  const finalPrice = currentPrice * (1 - (editData.discount_percent / 100));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('products').update({ image_url: editData.image_url }).eq('id', id);
      await supabase.from('product_variants').update({ discount_percent: editData.discount_percent }).eq('product_id', id);
      setIsEditing(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} className="text-blue-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-8 active:scale-95 transition-all">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LEFT: IMAGE AREA */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-[40px] border border-slate-200 aspect-square flex items-center justify-center overflow-hidden shadow-sm relative group">
            {product.image_url ? (
              <img src={product.image_url} className="w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-700" alt="Product" />
            ) : (
              <div className="text-center text-slate-200">
                <Package size={160} strokeWidth={1} />
                <p className="font-bold uppercase tracking-[0.3em] mt-4 text-xs">No Visual Data</p>
              </div>
            )}
            
            {editData.discount_percent > 0 && (
              <div className="absolute top-8 right-8 bg-red-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl animate-bounce">
                {Math.round(editData.discount_percent)}% OFF
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: DETAILS & BUNDLE ENGINE */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {product.brands?.name}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mt-4 leading-tight uppercase italic tracking-tighter">
              <span className="text-slate-300 not-italic mr-3">{product.category?.toUpperCase()}</span>
              {product.name}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Compatible: {variants[0]?.model_name || 'Universal Fit'}</p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative">
             <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                {bundlePricing.hasFront && (
                  <button onClick={() => setSelectedBundle('front')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'front' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                    Front (2pcs)
                  </button>
                )}
                {bundlePricing.hasRear && (
                  <button onClick={() => setSelectedBundle('rear')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'rear' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                    Rear (2pcs)
                  </button>
                )}
                <button onClick={() => setSelectedBundle('full')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'full' ? "bg-[#020617] text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                  Full Set (4pcs)
                </button>
             </div>

             <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-slate-900 italic tracking-tighter">
                  RM {finalPrice.toFixed(2)}
                </span>
                {editData.discount_percent > 0 && (
                  <span className="text-xl text-slate-300 line-through font-bold italic">RM {currentPrice.toFixed(2)}</span>
                )}
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" /> Professional Grade Spare Part • Ready for Dispatch
             </p>

             <button 
              onClick={() => addToCart(variants[0].id)}
              className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-bold mt-8 flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95 transition-all text-lg"
             >
                <ShoppingCart size={24} strokeWidth={2.5} /> Add Bundle to Cart
             </button>
          </div>

          {/* ADMIN TOGGLE & EDIT MODE */}
          {isAdmin && (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-500 uppercase tracking-widest">
                     <Settings size={14} /> Admin Tools
                  </div>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[10px] font-bold text-blue-600 hover:underline active:scale-90 transition-all"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Marketplace Data'}
                  </button>
               </div>
               
               {isEditing && (
                 <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">External Image URL (ImgBB)</label>
                       <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500" value={editData.image_url} onChange={e => setEditData({...editData, image_url: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Discount (%)</label>
                       <div className="flex items-center gap-4">
                          <input type="number" className="w-32 p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500" value={editData.discount_percent} onChange={e => setEditData({...editData, discount_percent: parseFloat(e.target.value) || 0})} />
                          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase italic">Saving RM {(currentPrice - finalPrice).toFixed(2)}</div>
                       </div>
                    </div>
                    <button onClick={handleUpdate} className="w-full bg-[#020617] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                       <Save size={16} /> Sync Changes
                    </button>
                 </div>
               )}
            </div>
          )}

          {/* Technical Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master SKU</p>
                <p className="text-sm font-bold text-slate-700">{variants[0]?.item_code}</p>
             </div>
             <div className="p-4 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bin Location</p>
                <p className="text-sm font-bold text-slate-700 italic uppercase">{variants[0]?.bin_location || 'A1-01'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}