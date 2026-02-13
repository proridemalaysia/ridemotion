"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, CheckCircle2, Package, ArrowLeft, 
  Settings, Save, ExternalLink, ShieldCheck, Tag, 
  Plus, Trash2, ChevronLeft, ChevronRight 
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
  const [syncing, setSyncing] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  
  // Gallery & Selection States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState<'front' | 'rear' | 'full'>('full');
  
  // Admin Edit States
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editDiscount, setEditDiscount] = useState(0);

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
        setEditImages(prodData.image_urls || []);
        setEditDiscount(varData?.[0]?.discount_percent || 0);
      }
      if (varData) setVariants(varData);
      
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  const bundles = useMemo(() => {
    const frontLH = variants.find(v => v.position?.toUpperCase() === 'FRONT LH');
    const frontRH = variants.find(v => v.position?.toUpperCase() === 'FRONT RH');
    const frontSingle = variants.find(v => v.position?.toUpperCase() === 'FRONT');
    const rear = variants.find(v => v.position?.toUpperCase() === 'REAR');

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

  const currentPrice = bundles[selectedBundle].price;
  const finalPrice = currentPrice * (1 - (editDiscount / 100));

  const handleUpdate = async () => {
    setSyncing(true);
    try {
      await supabase.from('products').update({ image_urls: editImages }).eq('id', id);
      await supabase.from('product_variants').update({ discount_percent: editDiscount }).eq('product_id', id);
      setIsEditing(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setSyncing(false); }
  };

  const addImage = () => {
    if (!newImageUrl) return;
    setEditImages([...editImages, newImageUrl]);
    setNewImageUrl("");
  };

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} className="text-blue-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase mb-8 active:scale-95 transition-all">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LEFT: LIGHTBOX GALLERY */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="bg-white rounded-[40px] border border-slate-200 aspect-square flex items-center justify-center overflow-hidden shadow-sm relative group">
            {editImages.length > 0 ? (
              <img src={editImages[activeImageIndex]} className="w-full h-full object-contain p-10 transition-all duration-500" alt="Part View" />
            ) : (
              <Package size={160} strokeWidth={1} className="text-slate-200" />
            )}
            
            {editDiscount > 0 && (
              <div className="absolute top-8 right-8 bg-red-600 text-white font-bold px-4 py-2 rounded-2xl shadow-xl">
                {Math.round(editDiscount)}% OFF
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {editImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
               {editImages.map((img, idx) => (
                 <button 
                  key={idx} 
                  onClick={() => setActiveImageIndex(idx)}
                  className={clsx(
                    "w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition-all active:scale-90",
                    activeImageIndex === idx ? "border-blue-600 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                 >
                   <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {product.brands?.name || 'Genuine'}
              </span>
            </div>
            {/* REQUIREMENT: Category (UPPERCASE) + Name (SAME STYLE/COLOR) */}
            <h1 className="text-4xl font-bold text-slate-900 mt-4 leading-tight uppercase italic tracking-tighter">
              <span className="mr-3">{product.category}</span>
              {product.name}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 font-mono italic">Item Code: {variants[0]?.item_code}</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative">
             <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-100 pb-6">
                {bundles.front.available && (
                  <button onClick={() => setSelectedBundle('front')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'front' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>
                    Front Set (2pcs)
                  </button>
                )}
                {bundles.rear.available && (
                  <button onClick={() => setSelectedBundle('rear')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'rear' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>
                    Rear Set (2pcs)
                  </button>
                )}
                <button onClick={() => setSelectedBundle('full')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'full' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>
                  Full Set (4pcs)
                </button>
             </div>

             <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-slate-900 italic tracking-tighter">RM {finalPrice.toFixed(2)}</span>
                {editDiscount > 0 && <span className="text-xl text-slate-300 line-through font-bold">RM {currentPrice.toFixed(2)}</span>}
             </div>
             
             {/* REQUIREMENT: MAINTAIN "ADD TO CART" TEXT */}
             <button 
              onClick={() => bundles[selectedBundle].ids.forEach(id => addToCart(id))} 
              className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-bold mt-8 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 text-lg uppercase tracking-widest"
             >
                <ShoppingCart size={24} strokeWidth={2} /> Add To Cart
             </button>
          </div>

          {/* ADMIN MANAGEMENT */}
          {isAdmin && (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-blue-600"><Settings size={14} /> Admin Gallery & Pricing</span>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:underline active:scale-90 transition-all font-bold">
                    {isEditing ? 'Cancel Changes' : 'Manage Images & Discount'}
                  </button>
               </div>
               
               {isEditing && (
                 <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Multi-Image Manager */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Images (Paste Links)</label>
                       <div className="flex gap-2">
                        <input className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="ImgBB Link..." />
                        <button onClick={addImage} className="bg-blue-600 text-white p-3 rounded-xl active:scale-90 transition-all"><Plus size={18}/></button>
                       </div>
                       <div className="grid grid-cols-4 gap-2 mt-4">
                          {editImages.map((img, i) => (
                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
                               <img src={img} className="w-full h-full object-cover" />
                               <button onClick={() => setEditImages(editImages.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Individual Item Discount (%)</label>
                       <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={editDiscount} onChange={e => setEditDiscount(parseFloat(e.target.value) || 0)} />
                    </div>

                    <button onClick={handleUpdate} disabled={syncing} className="w-full bg-[#020617] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg">
                       {syncing ? <Spinner size={16} /> : <Save size={16} />}
                       {syncing ? 'Saving Array...' : 'Sync All Assets'}
                    </button>
                 </div>
               )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Warehouse Bin</p>
                <p className="text-sm font-bold text-slate-700 uppercase italic font-mono text-center">{variants[0]?.bin_location || 'A1-SECTION'}</p>
             </div>
             <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Current Stock</p>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-center">{variants[0]?.stock_quantity || 0} Units</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}