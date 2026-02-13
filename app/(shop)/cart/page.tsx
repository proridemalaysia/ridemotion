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
  Star 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';

export default function ShopHomePage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchStoreData();
  }, [selectedCat]);

  async function fetchStoreData() {
    setLoading(true);
    try {
      // 1. Fetch Distinct Categories from the Products table
      const { data: catData } = await supabase.from('products').select('category');
      if (catData) {
        const uniqueCats = Array.from(new Set(catData.map(c => c.category))).sort();
        setCategories(uniqueCats);
      }

      // 2. Fetch Variants joined with parent Products and Brands
      let query = supabase
        .from('product_variants')
        .select(`
          *,
          products!inner (
            name,
            category,
            brands (name)
          )
        `)
        .eq('products.is_published', true); // Only show published
      
      // Filter by Category Text if selected
      if (selectedCat) {
        query = query.eq('products.category', selectedCat);
      }

      const { data: prodData, error } = await query.order('part_number', { ascending: true });

      if (error) throw error;
      if (prodData) setVariants(prodData);
      
    } catch (err) {
      console.error("Storefront Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Search Filtering (Client Side for speed)
  const filteredVariants = variants.filter(v => {
    const searchLower = searchTerm.toLowerCase();
    return (
      v.part_number?.toLowerCase().includes(searchLower) ||
      v.sku?.toLowerCase().includes(searchLower) ||
      v.products?.name?.toLowerCase().includes(searchLower) ||
      v.products?.brands?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex gap-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      
      {/* SIDEBAR: Category Filter */}
      <aside className="w-64 hidden md:block shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28 shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
            <Filter size={14} className="text-blue-600" /> Browse Catalog
          </h3>
          
          <div className="relative mb-6">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
             <input 
                type="text" 
                placeholder="Search SKU..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <ul className="space-y-1">
            <li 
              onClick={() => setSelectedCat(null)}
              className={clsx(
                "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight cursor-pointer transition-all active:scale-95",
                !selectedCat ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              All Products
            </li>
            {categories.map((cat) => (
              <li 
                key={cat} 
                onClick={() => setSelectedCat(cat)}
                className={clsx(
                  "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight cursor-pointer transition-all flex justify-between items-center active:scale-95",
                  selectedCat === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                )}
              >
                {cat}
                {selectedCat === cat && <ChevronRight size={14}/>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* MAIN CONTENT: Product Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Spinner size={40} className="text-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Syncing Warehouse...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center px-2">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight italic uppercase">
                    {selectedCat ? selectedCat : 'Warehouse Catalog'}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {filteredVariants.length} items found in live inventory
                  </p>
               </div>
            </div>

            {filteredVariants.length === 0 ? (
              <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-100">
                 <Package size={64} className="mx-auto text-slate-100 mb-6" />
                 <h3 className="text-lg font-bold text-slate-800 uppercase italic">No matching parts</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Check back soon for restock</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVariants.map((v) => {
                  const isStockOut = (v.stock_quantity || 0) <= 0;
                  const price = v.price_online && v.price_online > 0 ? v.price_online : v.price_myr;

                  return (
                    <div key={v.id} className="bg-white rounded-[32px] border border-slate-200 hover:border-blue-500 transition-all duration-300 group flex flex-col h-full overflow-hidden shadow-sm hover:shadow-2xl">
                      {/* Image Frame */}
                      <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative border-b border-slate-100">
                        <Package size={60} strokeWidth={1} className="text-slate-200 group-hover:scale-110 transition-transform duration-700" />
                        
                        {isStockOut && (
                           <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                              <span className="px-5 py-2 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-full">Out of Stock</span>
                           </div>
                        )}

                        <div className="absolute top-4 left-4 z-20">
                           <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-bold text-blue-600 border border-slate-100 uppercase tracking-tighter shadow-sm">
                              {v.products?.brands?.name || 'GENUINE'}
                           </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-slate-800 line-clamp-2 h-12 leading-tight mb-1 uppercase italic tracking-tighter">
                          {v.part_number}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                           {v.products?.name}
                        </p>
                        
                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                                <div className="text-blue-600 flex items-baseline gap-0.5">
                                    <span className="text-xs font-bold italic">RM</span>
                                    <span className="text-2xl font-bold tracking-tighter italic">
                                      {Number(price || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                   <Star size={10} className="text-amber-400 fill-amber-400"/>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Ready Stock</span>
                                </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); addToCart(v.id); }}
                              disabled={isStockOut}
                              className="bg-[#2563EB] text-white p-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-90 hover:bg-blue-700 transition-all disabled:opacity-30"
                            >
                              <ShoppingCart size={22} strokeWidth={2.5} />
                            </button>
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
  );
}