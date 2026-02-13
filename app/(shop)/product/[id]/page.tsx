"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, Star, CheckCircle2, Package, ArrowLeft, 
  Settings, Save, ImageIcon, ExternalLink, Percent, ShieldCheck, Tag, AlertCircle 
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

      const { data: prodData, error: pError } = await supabase.from('products').select('*, brands(name)').eq('id', id).single();
      const { data: varData, error: vError } = await supabase.from('product_variants').select('*').eq('product_id', id);

      if (pError) throw pError;

      if (prodData) {
        setProduct(prodData);
        setEditData({ 
          image_url: prodData.image_url || '', 
          discount_percent: varData?.[0]?.discount_percent || 0 
        });
      }
      if (varData) setVariants(varData);
      
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
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

  const currentBundle = bundles[selectedBundle];
  const finalPrice = currentBundle.price * (1 - (editData.discount_percent / 100));

  const handleAddToCart = () => {
    currentBundle.ids.forEach(id => addToCart(id));
    alert(`${selectedBundle.toUpperCase()} Set added to cart!`);
  };

  const handleUpdate = async () => {
    setSyncing(true);
    try {
      // 1. Update Image in Products table
      const { error: imgError } = await supabase
        .from('products')
        .update({ image_url: editData.image_url })
        .eq('id', id);

      if (imgError) throw imgError;

      // 2. Update Discount in Product Variants table
      const { error: discError } = await supabase
        .from('product_variants')
        .update({ discount_percent: editData.discount_percent })
        .eq('product_id', id);

      if (discError) throw discError;

      alert("Data synchronized successfully!");
      setIsEditing(false);
      fetchData(); // Refresh data from server
    } catch (err: any) { 
      alert("Save Error: " + err.message); 
    } finally { 
      setSyncing(false); 
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} className="text-blue-600" /></div>;
  if (!product) return <div className="text-center py-40">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase mb-8 active:scale-95 transition-all">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* LEFT: IMAGE AREA */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-[40px] border border-slate-200 aspect-square flex items-center justify-center overflow-hidden shadow-sm relative group">
            {product.image_url ? (
              <img src={product.image_url} className="w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-700" alt="Part" />
            ) : (
              <div className="text-center text-slate-200">
                <Package size={160} strokeWidth={1} className="text-slate-200" />
              </div>
            )}
            {editData.discount_percent > 0 && (
              <div className="absolute top-8 right-8 bg-red-600 text-white font-bold px-4 py-2 rounded-2xl shadow-xl z-20">
                {Math.round(editData.discount_percent)}% OFF
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {product.brands?.name || 'Genuine'}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mt-4 leading-tight uppercase italic tracking-tighter">
              <span className="text-slate-300 not-italic mr-3 uppercase font-medium">{product.category}</span>
              {product.name}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Item Code: {variants[0]?.item_code}</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative">
             <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-100 pb-6">
                {bundles.front.available && (
                  <button onClick={() => setSelectedBundle('front')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'front' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                    Front Set (2pcs)
                  </button>
                )}
                {bundles.rear.available && (
                  <button onClick={() => setSelectedBundle('rear')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'rear' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                    Rear Set (2pcs)
                  </button>
                )}
                <button onClick={() => setSelectedBundle('full')} className={clsx("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95", selectedBundle === 'full' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                  Full Set (4pcs)
                </button>
             </div>

             <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-slate-900 italic tracking-tighter">RM {finalPrice.toFixed(2)}</span>
                {editData.discount_percent > 0 && <span className="text-xl text-slate-300 line-through font-bold italic">RM {currentBundle.price.toFixed(2)}</span>}
             </div>
             
             <button 
              onClick={handleAddToCart} 
              className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-bold mt-8 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 text-lg"
             >
                <ShoppingCart size={24} strokeWidth={2} /> Add {selectedBundle.toUpperCase()} Bundle to Cart
             </button>
          </div>

          {/* ADMIN MANAGEMENT */}
          {isAdmin && (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-blue-600"><Settings size={14} /> Marketplace Management</span>
                  <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="text-blue-600 hover:underline active:scale-90 transition-all font-bold"
                  >
                    {isEditing ? 'Cancel Changes' : 'Edit Product Details'}
                  </button>
               </div>
               
               {isEditing && (
                 <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ImgBB Image Direct Link</label>
                       <div className="flex gap-2">
                        <input 
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                          value={editData.image_url} 
                          onChange={e => setEditData({...editData, image_url: e.target.value})} 
                          placeholder="https://i.ibb.co/..." 
                        />
                        <a href="https://imgbb.com" target="_blank" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 active:scale-90 transition-all"><ExternalLink size={18}/></a>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Promotional Discount (%)</label>
                       <div className="flex items-center gap-4">
                          <div className="relative">
                            <input 
                              type="number" 
                              className="w-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500" 
                              value={editData.discount_percent} 
                              onChange={e => setEditData({...editData, discount_percent: parseFloat(e.target.value) || 0})} 
                            />
                            <Percent size={14} className="absolute right-3 top-3.5 text-slate-300" />
                          </div>
                          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase bg-red-50 px-3 py-2 rounded-xl">
                            <Tag size={12}/> Saving RM {(currentPrice - finalPrice).toFixed(2)}
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleUpdate} 
                      disabled={syncing}
                      className="w-full bg-[#020617] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                       {syncing ? <Spinner size={16} /> : <Save size={16} />}
                       {syncing ? 'Synchronizing Database...' : 'Sync Product Data'}
                    </button>
                 </div>
               )}
            </div>
          )}

          {/* Technical Spec Footer */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Location</p>
                <p className="text-sm font-bold text-slate-700 uppercase italic">{variants[0]?.bin_location || 'A1-SECTION'}</p>
             </div>
             <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${variants[0]?.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                   <p className="text-sm font-bold text-slate-700 uppercase tracking-tighter">{variants[0]?.stock_quantity || 0} Units in Warehouse</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}