"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, CheckCircle2, Package, ArrowLeft, 
  Settings, Save, ExternalLink, ShieldCheck, Tag, 
  Plus, Trash2, ChevronLeft, ChevronRight, Star,
  AlignLeft, ListChecks
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, isInitialized } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState<'front' | 'rear' | 'full'>('full');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');
  
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editDiscount, setEditDiscount] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [editSpecs, setEditSpecs] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
        setIsAdmin(profile?.role === 'admin' || profile?.role === 'staff');
      }

      const { data: prodData } = await supabase.from('products').select('*, brands(name)').eq('id', id).single();
      const { data: varData } = await supabase.from('product_variants').select('*').eq('product_id', id);

      if (prodData) {
        setProduct(prodData);
        setEditImages(prodData.image_urls || []);
        setEditDesc(prodData.description || "");
        setEditSpecs(prodData.specifications || "");
        setEditDiscount(varData?.[0]?.discount_percent || 0);
      }
      if (varData) setVariants(varData);
      
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bundles = useMemo(() => {
    const getPrice = (v: any) => Number(v?.price_online || v?.price_myr || 0);
    const front = variants.filter(v => v.position?.toUpperCase().includes('FRONT'));
    const rear = variants.filter(v => v.position?.toUpperCase().includes('REAR'));

    const calc = (parts: any[]) => {
      if (parts.length >= 2) return { price: getPrice(parts[0]) + getPrice(parts[1]), data: parts };
      if (parts.length === 1) return { price: getPrice(parts[0]) * 2, data: [parts[0]] };
      return { price: 0, data: [] };
    };

    const fObj = calc(front);
    const rObj = calc(rear);

    return {
      front: { price: fObj.price, components: fObj.data, available: fObj.price > 0 },
      rear: { price: rObj.price, components: rObj.data, available: rObj.price > 0 },
      full: { price: fObj.price + rObj.price, components: [...fObj.data, ...rObj.data], available: (fObj.price + rObj.price) > 0 }
    };
  }, [variants]);

  const currentBundle = bundles[selectedBundle];
  const finalPrice = currentBundle.price * (1 - (editDiscount / 100));

  const handleAddToCart = async () => {
    if (!isInitialized) return;
    setSyncing(true);
    
    try {
      // Add each component of the bundle to the cart
      // We pass the full variant object so the local cart can display it without re-fetching
      for (const variant of currentBundle.components) {
        await addToCart(variant.id, {
            ...variant,
            products_flat: product // Attach parent info
        });
      }
      router.push('/cart');
    } catch (err) {
      console.error("Cart process failed", err);
    } finally {
      setSyncing(false);
    }
  };

  // Admin Media Helpers
  const addImage = () => {
    if (!newImageUrl) return;
    setEditImages(prev => [...prev, newImageUrl]);
    setNewImageUrl("");
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newArr = [...editImages];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newArr.length) return;
    [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
    setEditImages(newArr);
  };

  const setAsMain = (index: number) => {
    const newArr = [...editImages];
    const selected = newArr.splice(index, 1)[0];
    newArr.unshift(selected);
    setEditImages(newArr);
    setActiveImageIndex(0);
  };

  const removeImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
    if (activeImageIndex >= editImages.length - 1) setActiveImageIndex(0);
  };

  const handleUpdate = async () => {
    setSyncing(true);
    try {
      await supabase.from('products').update({ 
        image_urls: editImages,
        description: editDesc,
        specifications: editSpecs
      }).eq('id', id);
      
      await supabase.from('product_variants').update({ 
        discount_percent: editDiscount 
      }).eq('product_id', id);

      alert("Data synchronized successfully!");
      setIsEditing(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setSyncing(false); }
  };

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} className="text-blue-600" /></div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 pb-32 font-sans">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase mb-8 active:scale-95 transition-all outline-none">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* LEFT: GALLERY AREA */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 aspect-square flex items-center justify-center overflow-hidden shadow-sm relative group">
            {editImages.length > 0 ? (
              <img src={editImages[activeImageIndex]} className="w-full h-full object-contain p-10 transition-all duration-500" alt="Main View" />
            ) : (
              <Package size={160} strokeWidth={1} className="text-slate-200" />
            )}
            {editDiscount > 0 && <div className="absolute top-8 right-8 bg-red-600 text-white font-bold px-4 py-2 rounded-2xl shadow-xl">-{Math.round(editDiscount)}%</div>}
          </div>

          <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
             {editImages.map((img, idx) => (
               <button key={idx} onClick={() => setActiveImageIndex(idx)} className={clsx("w-20 h-20 rounded-2xl border-2 shrink-0 transition-all active:scale-90 overflow-hidden", activeImageIndex === idx ? "border-blue-600" : "border-transparent opacity-60")}>
                 <img src={img} className="w-full h-full object-cover" />
               </button>
             ))}
          </div>

          <div className="mt-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
             <div className="flex bg-slate-50 border-b">
                <button onClick={() => setActiveTab('desc')} className={clsx("px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'desc' ? "bg-white text-blue-600 border-r" : "text-slate-400")}>Description</button>
                <button onClick={() => setActiveTab('specs')} className={clsx("px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'specs' ? "bg-white text-blue-600 border-x" : "text-slate-400")}>Specifications</button>
             </div>
             <div className="p-8 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activeTab === 'desc' ? (product.description || "No description provided.") : (product.specifications || "No technical specs provided.")}
             </div>
          </div>
        </div>

        {/* RIGHT: DETAILS AREA */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{product.brands?.name}</span>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight uppercase italic tracking-tighter">
              <span className="mr-3 uppercase font-medium">{product.category}</span>
              {product.name}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest font-mono">Item Code: {variants[0]?.item_code}</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-8">
             <div className="flex flex-wrap gap-3">
                {bundles.front.available && <button onClick={() => setSelectedBundle('front')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'front' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Front Set (2pcs)</button>}
                {bundles.rear.available && <button onClick={() => setSelectedBundle('rear')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'rear' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Rear Set (2pcs)</button>}
                <button onClick={() => setSelectedBundle('full')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'full' ? "bg-[#020617] text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Full Set (4pcs)</button>
             </div>

             <div className="flex items-baseline gap-4 pt-4 border-t">
                <span className="text-5xl font-bold text-slate-900 italic tracking-tighter">RM {finalPrice.toFixed(2)}</span>
                {editDiscount > 0 && <span className="text-xl text-slate-300 line-through font-bold">RM {currentPrice.toFixed(2)}</span>}
             </div>
             
             <button 
              onClick={handleAddToCart}
              disabled={syncing}
              className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 text-lg uppercase tracking-widest"
             >
                {syncing ? <Spinner size={24} /> : <ShoppingCart size={24} strokeWidth={2} />} 
                Add To Cart
             </button>
          </div>

          {/* ADMIN MARKETPLACE MANAGER */}
          {isAdmin && (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-lg border-t-4 border-t-blue-600">
               <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                  <span className="flex items-center gap-2 font-bold text-xs text-blue-600 uppercase tracking-widest"><Settings size={14} /> Admin Marketplace Control</span>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">{isEditing ? 'Close' : 'Manage Data'}</button>
               </div>
               
               {isEditing && (
                 <div className="p-8 space-y-10 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gallery Sequence Manager</label>
                       <div className="flex gap-2">
                        <input className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Paste ImgBB URL..." />
                        <button onClick={addImage} className="bg-blue-600 text-white p-3 rounded-xl active:scale-90"><Plus size={18}/></button>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {editImages.map((img, i) => (
                            <div key={i} className={clsx("relative group aspect-square rounded-2xl overflow-hidden border-2", i === 0 ? "border-blue-600 shadow-lg" : "border-slate-100")}>
                               <img src={img} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                                  <div className="flex gap-1">
                                    <button onClick={() => moveImage(i, 'left')} className="p-1 bg-white rounded text-slate-800"><ChevronLeft size={12}/></button>
                                    <button onClick={() => moveImage(i, 'right')} className="p-1 bg-white rounded text-slate-800"><ChevronRight size={12}/></button>
                                  </div>
                                  <button onClick={() => setAsMain(i)} className="px-2 py-1 bg-blue-600 text-white text-[8px] font-bold rounded uppercase">Set Main</button>
                                  <button onClick={() => removeImage(i)} className="p-1 bg-red-600 text-white rounded"><Trash2 size={12} /></button>
                               </div>
                               {i === 0 && <div className="absolute top-1 left-1 bg-blue-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded shadow">MAIN</div>}
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={12}/> Marketing Description</label>
                          <textarea rows={4} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-medium outline-none" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Marketing text..."/>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ListChecks size={12}/> Technical Specs</label>
                          <textarea rows={4} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-mono outline-none" value={editSpecs} onChange={e => setEditSpecs(e.target.value)} placeholder="OEM, Materials..."/>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Individual Item Discount (%)</label>
                       <input type="number" className="w-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={editDiscount} onChange={e => setEditDiscount(parseFloat(e.target.value) || 0)} />
                    </div>

                    <button onClick={handleUpdate} disabled={syncing} className="w-full bg-[#020617] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 shadow-lg">
                       {syncing ? <Spinner size={16} /> : <Save size={16} />} Sync Assets & Content
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