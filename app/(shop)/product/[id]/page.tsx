"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, CheckCircle2, Package, ArrowLeft, 
  Settings, Save, ExternalLink, ShieldCheck, Tag 
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
  
  const [selectedBundle, setSelectedBundle] = useState<'front' | 'rear' | 'full'>('full');
  const [editData, setEditData] = useState({ image_url: '', discount_percent: 0 });

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(profile?.role === 'admin' || profile?.role === 'staff');
      }

      const { data: prodData } = await supabase.from('products').select('*, brands(name)').eq('id', id).single();
      const { data: varData } = await supabase.from('product_variants').select('*').eq('product_id', id);

      if (prodData) {
        setProduct(prodData);
        setEditData({ image_url: prodData.image_url || '', discount_percent: varData?.[0]?.discount_percent || 0 });
      }
      if (varData) setVariants(varData);
      
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  const bundles = useMemo(() => {
    // 1. Identify Components
    const frontLH = variants.find(v => v.position?.toUpperCase() === 'FRONT LH');
    const frontRH = variants.find(v => v.position?.toUpperCase() === 'FRONT RH');
    const frontSingle = variants.find(v => v.position?.toUpperCase() === 'FRONT');
    const rear = variants.find(v => v.position?.toUpperCase() === 'REAR');

    // 2. Calculation Logic
    const getPrice = (v: any) => Number(v?.price_online || v?.price_myr || 0);

    let frontSet = 0;
    let frontComponents: string[] = [];
    if (frontLH && frontRH) {
      frontSet = getPrice(frontLH) + getPrice(frontRH);
      frontComponents = [frontLH.id, frontRH.id];
    } else if (frontSingle) {
      frontSet = getPrice(frontSingle) * 2;
      frontComponents = [frontSingle.id];
    }

    let rearSet = 0;
    let rearComponents: string[] = [];
    if (rear) {
      rearSet = getPrice(rear) * 2;
      rearComponents = [rear.id];
    }

    return {
      front: { price: frontSet, ids: frontComponents, available: frontSet > 0 },
      rear: { price: rearSet, ids: rearComponents, available: rearSet > 0 },
      full: { price: frontSet + rearSet, ids: [...frontComponents, ...rearComponents], available: (frontSet + rearSet) > 0 }
    };
  }, [variants]);

  const currentBundle = bundles[selectedBundle];
  const finalPrice = currentBundle.price * (1 - (editData.discount_percent / 100));

  const handleAddToCart = () => {
    // Add each component to cart based on bundle selection
    currentBundle.ids.forEach(id => addToCart(id));
    alert(`${selectedBundle.toUpperCase()} Set added to cart!`);
  };

  const handleUpdate = async () => {
    setLoading(true);
    await supabase.from('products').update({ image_url: editData.image_url }).eq('id', id);
    await supabase.from('product_variants').update({ discount_percent: editData.discount_percent }).eq('product_id', id);
    setIsEditing(false);
    fetchData();
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase mb-8 active:scale-95 transition-all">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* IMAGE */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-[40px] border border-slate-200 aspect-square flex items-center justify-center overflow-hidden shadow-sm relative">
            {product.image_url ? <img src={product.image_url} className="w-full h-full object-contain p-10" /> : <Package size={160} strokeWidth={1} className="text-slate-200" />}
            {editData.discount_percent > 0 && <div className="absolute top-8 right-8 bg-red-600 text-white font-bold px-4 py-2 rounded-2xl shadow-xl">{Math.round(editData.discount_percent)}% OFF</div>}
          </div>
        </div>

        {/* DETAILS */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mt-4 leading-tight uppercase italic tracking-tighter">
              <span className="text-slate-300 not-italic mr-3 uppercase">{product.category}</span>
              {product.name}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{product.brands?.name} • Genuine Replacement</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
             <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-100 pb-6">
                {bundles.front.available && (
                  <button onClick={() => setSelectedBundle('front')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'front' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Front (2pcs)</button>
                )}
                {bundles.rear.available && (
                  <button onClick={() => setSelectedBundle('rear')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'rear' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Rear (2pcs)</button>
                )}
                <button onClick={() => setSelectedBundle('full')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'full' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Full Set (4pcs)</button>
             </div>

             <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-slate-900 italic tracking-tighter">RM {finalPrice.toFixed(2)}</span>
                {editData.discount_percent > 0 && <span className="text-xl text-slate-300 line-through font-bold">RM {currentBundle.price.toFixed(2)}</span>}
             </div>
             
             <button onClick={handleAddToCart} className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-bold mt-8 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl">
                <ShoppingCart size={24} strokeWidth={2} /> Add {selectedBundle.toUpperCase()} Bundle to Cart
             </button>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                  <span className="flex items-center gap-2"><Settings size={14} /> Marketplace Admin</span>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:underline">{isEditing ? 'Cancel' : 'Edit'}</button>
               </div>
               {isEditing && (
                 <div className="p-6 space-y-4">
                    <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={editData.image_url} onChange={e => setEditData({...editData, image_url: e.target.value})} placeholder="ImgBB Link" />
                    <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={editData.discount_percent} onChange={e => setEditData({...editData, discount_percent: parseFloat(e.target.value) || 0})} placeholder="Discount %" />
                    <button onClick={handleUpdate} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs active:scale-95 transition-all">Sync Data</button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}