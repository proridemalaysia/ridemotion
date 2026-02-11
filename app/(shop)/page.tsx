"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, 
  Filter, 
  Package, 
  ChevronRight, 
  Search, 
  X, 
  Star // Added missing import
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';

export default function ShopHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchStoreData();
  }, [selectedCat]);

  async function fetchStoreData() {
    setLoading(true);
    let query = supabase
      .from('products')
      .select(`*, product_variants(*), categories(name)`)
      .eq('is_published', true)
      .eq('is_archived', false);
    
    if (selectedCat) {
      query = query.eq('category_id', selectedCat);
    }

    const { data } = await query.order('created_at', { ascending: false });
    const { data: cats } = await supabase.from('categories').select('*').order('name');

    if (data) setProducts(data);
    if (cats) setCategories(cats);
    setLoading(false);
  }

  // Handle Search filtering
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_variants?.[0]?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex gap-8">
        {/* Sidebar Filter */}
        <aside className="w-64 hidden md:block shrink-0">
          <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sticky top-28">
            <h3 className="font-black flex items-center gap-2 mb-6 text-slate-800 text-[10px] tracking-[0.2em] uppercase">
              <Filter size={16} className="text-orange-600" /> Filter Parts
            </h3>
            
            <div className="relative mb-6">
               <Search className="absolute left-3 top-2.5 text-slate-300" size={14} />
               <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
               {searchTerm && (
                 <X 
                  size={14} 
                  className="absolute right-3 top-2.5 text-slate-300 cursor-pointer hover:text-orange-600" 
                  onClick={() => setSearchTerm("")} 
                 />
               )}
            </div>

            <ul className="space-y-1">
              <li 
                onClick={() => setSelectedCat(null)}
                className={clsx(
                  "flex justify-between items-center px-4 py-3 rounded-2xl cursor-pointer transition-all text-xs font-black uppercase tracking-tight",
                  !selectedCat ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                All Categories {!selectedCat && <ChevronRight size={14}/>}
              </li>
              {categories.map((cat) => (
                <li 
                  key={cat.id} 
                  onClick={() => setSelectedCat(cat.id)}
                  className={clsx(
                    "flex justify-between items-center px-4 py-3 rounded-2xl cursor-pointer transition-all text-xs font-black uppercase tracking-tight",
                    selectedCat === cat.id ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "text-slate-500 hover:bg-slate-50 hover:text-orange-600"
                  )}
                >
                  {cat.name} {selectedCat === cat.id && <ChevronRight size={14}/>}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Spinner size={40} className="text-orange-600" />
              <p className="text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">Scanning Inventory...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8 px-2">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                   Results Found: {filteredProducts.length}
                 </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-100">
                   <Package size={64} className="mx-auto text-slate-100 mb-6" />
                   <h3 className="text-xl font-black text-slate-800 italic uppercase">No matching parts</h3>
                   <p className="text-slate-400 text-sm mt-2 font-medium">Try searching for a vehicle model or SKU.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const variant = product.product_variants?.[0];
                    const isStockOut = (variant?.stock_quantity || 0) <= 0;

                    return (
                      <div key={product.id} className="bg-white rounded-[32px] border border-transparent hover:border-orange-500 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full relative overflow-hidden">
                        {/* Image Frame */}
                        <div className="aspect-[4/5] bg-slate-50 flex items-center justify-center relative overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                              alt={product.name}
                            />
                          ) : (
                            <Package size={60} strokeWidth={1} className="text-slate-200" />
                          )}
                          
                          {isStockOut && (
                             <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                                <span className="px-5 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full">Sold Out</span>
                             </div>
                          )}

                          <div className="absolute top-4 left-4 z-20">
                             <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-800 uppercase shadow-sm border border-slate-100">
                                {product.brand_name || 'GENUINE'}
                             </span>
                          </div>

                          <div className="absolute bottom-4 right-4 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                             <button 
                              onClick={() => addToCart(variant.id)}
                              disabled={isStockOut}
                              className="bg-orange-600 text-white p-5 rounded-[20px] shadow-2xl shadow-orange-200 active:scale-90 hover:bg-orange-700"
                             >
                               <ShoppingCart size={24} />
                             </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight h-10 mb-4 group-hover:text-orange-600 transition-colors uppercase italic tracking-tighter">
                            {product.name}
                          </h3>
                          
                          <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-4">
                              <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-300 line-through">RM {(variant?.price_online * 1.2).toFixed(2)}</span>
                                  <div className="text-orange-600 flex items-baseline gap-0.5">
                                      <span className="text-xs font-black italic">RM</span>
                                      <span className="text-2xl font-black tracking-tighter italic">{variant?.price_online?.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end">
                                 <div className="flex text-amber-400">
                                   <Star size={10} fill="currentColor"/>
                                   <Star size={10} fill="currentColor"/>
                                   <Star size={10} fill="currentColor"/>
                                 </div>
                                 <span className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-widest">In Stock</span>
                              </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}