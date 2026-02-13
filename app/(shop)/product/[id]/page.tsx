"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, CheckCircle2, Package, ArrowLeft, 
  Settings, Save, ExternalLink, ShieldCheck, Tag, 
  Plus, Trash2, ChevronLeft, ChevronRight, Star,
  MoveHorizontal, AlignLeft, ListChecks
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
  
  // UI States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState<'front' | 'rear' | 'full'>('full');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');
  
  // Admin Edit States
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editDiscount, setEditDiscount] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [editSpecs, setEditSpecs] = useState("");

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
        setEditDesc(prodData.description || "");
        setEditSpecs(prodData.specifications || "");
        setEditDiscount(varData?.[0]?.discount_percent || 0);
      }
      if (varData) setVariants(varData);
      
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  // --- IMAGE SEQUENCING LOGIC ---
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

  // --- BUNDLE CALCULATION ---
  const bundles = useMemo(() => {
    const getPrice = (v: any) => Number(v?.price_online || v?.price_myr || 0);
    const front = variants.filter(v => v.position?.toUpperCase().includes('FRONT'));
    const rear = variants.filter(v => v.position?.toUpperCase().includes('REAR'));

    const calc = (parts: any[]) => {
      if (parts.length >= 2) return getPrice(parts[0]) + getPrice(parts[1]);
      if (parts.length === 1) return getPrice(parts[0]) * 2;
      return 0;
    };

    const fPrice = calc(front);
    const rPrice = calc(rear);

    return {
      front: { price: fPrice, ids: front.map(v => v.id), available: fPrice > 0 },
      rear: { price: rPrice, ids: rear.map(v => v.id), available: rPrice > 0 },
      full: { price: fPrice + rPrice, ids: variants.map(v => v.id), available: (fPrice + rPrice) > 0 }
    };
  }, [variants]);

  const currentPrice = bundles[selectedBundle].price;
  const finalPrice = currentPrice * (1 - (editDiscount / 100));

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

      alert("Product successfully updated!");
      setIsEditing(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setSyncing(false); }
  };

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} className="text-blue-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase mb-8 active:scale-95 transition-all">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LEFT: GALLERY */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 aspect-square flex items-center justify-center overflow-hidden shadow-sm relative group">
            {editImages.length > 0 ? (
              <img src={editImages[activeImageIndex]} className="w-full h-full object-contain p-10 transition-all duration-500" alt="View" />
            ) : (
              <Package size={160} strokeWidth={1} className="text-slate-200" />
            )}
            {editDiscount > 0 && <div className="absolute top-8 right-8 bg-red-600 text-white font-bold px-4 py-2 rounded-2xl shadow-xl">{Math.round(editDiscount)}% OFF</div>}
          </div>

          <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
             {editImages.map((img, idx) => (
               <button key={idx} onClick={() => setActiveImageIndex(idx)} className={clsx("w-20 h-20 rounded-2xl border-2 shrink-0 transition-all active:scale-90 overflow-hidden", activeImageIndex === idx ? "border-blue-600" : "border-transparent opacity-60")}>
                 <img src={img} className="w-full h-full object-cover" />
               </button>
             ))}
          </div>

          {/* CUSTOMER TABS: Description & Specs */}
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
             <div className="flex bg-slate-50 border-b border-slate-200">
                <button onClick={() => setActiveTab('desc')} className={clsx("px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'desc' ? "bg-white text-blue-600 border-r border-slate-200" : "text-slate-400")}>Description</button>
                <button onClick={() => setActiveTab('specs')} className={clsx("px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'specs' ? "bg-white text-blue-600 border-x border-slate-200" : "text-slate-400")}>Specifications</button>
             </div>
             <div className="p-8">
                {activeTab === 'desc' ? (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description || "No description available."}</p>
                ) : (
                  <p className="text-slate-600 leading-relaxed font-mono text-sm whitespace-pre-wrap">{product.specifications || "Technical data pending update."}</p>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight uppercase italic tracking-tighter">
              <span className="mr-3">{product.category}</span>
              {product.name}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{product.brands?.name} • Genuine Replacement</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative">
             <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-100 pb-6">
                {bundles.front.available && <button onClick={() => setSelectedBundle('front')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'front' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Front Set (2pcs)</button>}
                {bundles.rear.available && <button onClick={() => setSelectedBundle('rear')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'rear' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Rear Set (2pcs)</button>}
                <button onClick={() => setSelectedBundle('full')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'full' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>Full Set (4pcs)</button>
             </div>

             <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-slate-900 italic tracking-tighter">RM {finalPrice.toFixed(2)}</span>
                {editDiscount > 0 && <span className="text-xl text-slate-300 line-through font-bold">RM {currentPrice.toFixed(2)}</span>}
             </div>
             
             <button onClick={() => bundles[selectedBundle].ids.forEach(id => addToCart(id))} className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-bold mt-8 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 text-lg uppercase tracking-widest">
                <ShoppingCart size={24} strokeWidth={2} /> Add To Cart
             </button>
          </div>

          {/* ADMIN MANAGEMENT */}
          {isAdmin && (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-lg">
               <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-blue-600"><Settings size={14} /> Global Marketplace Manager</span>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:underline active:scale-90 transition-all font-bold tracking-widest">
                    {isEditing ? 'Cancel Edit' : 'Edit Assets & Text'}
                  </button>
               </div>
               
               {isEditing && (
                 <div className="p-8 space-y-10 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Media Sequencer */}
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Image Sequence (Drag/Move)</label>
                       <div className="flex gap-2">
                        <input className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="ImgBB URL..." />
                        <button onClick={addImage} className="bg-blue-600 text-white p-3 rounded-xl active:scale-90 transition-all"><Plus size={18}/></button>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {editImages.map((img, i) => (
                            <div key={i} className={clsx("relative group aspect-square rounded-2xl overflow-hidden border-2", i === 0 ? "border-blue-600 shadow-lg" : "border-slate-100")}>
                               <img src={img} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                  <div className="flex gap-1">
                                    <button onClick={() => moveImage(i, 'left')} className="p-1.5 bg-white rounded-lg text-slate-800 hover:bg-blue-50 transition-all"><ChevronLeft size={14}/></button>
                                    <button onClick={() => moveImage(i, 'right')} className="p-1.5 bg-white rounded-lg text-slate-800 hover:bg-blue-50 transition-all"><ChevronRight size={14}/></button>
                                  </div>
                                  <button onClick={() => setAsMain(i)} className="px-2 py-1 bg-blue-600 text-white text-[8px] font-bold rounded uppercase flex items-center gap-1 shadow-lg">
                                    <Star size={10} fill="currentColor" /> Set Main
                                  </button>
                                  <button onClick={() => setEditImages(editImages.filter((_, idx) => idx !== i))} className="p-1.5 bg-red-600 text-white rounded-lg active:scale-90"><Trash2 size={14} /></button>
                               </div>
                               {i === 0 && <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase shadow-md">Main Page</div>}
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    {/* Content Editor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={12}/> Description</label>
                          <textarea rows={4} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Describe the product..."/>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ListChecks size={12}/> Tech Specs</label>
                          <textarea rows={4} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500" value={editSpecs} onChange={e => setEditSpecs(e.target.value)} placeholder="Part No, OEM Code, Length..."/>
                       </div>
                    </div>

                    <div className="pt-6 border-t">
                      <button onClick={handleUpdate} disabled={syncing} className="w-full bg-[#020617] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl">
                         {syncing ? <Spinner size={16} /> : <Save size={16} />} Sync Assets & Content
                      </button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}