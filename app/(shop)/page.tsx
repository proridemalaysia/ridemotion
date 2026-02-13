"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, Filter, Package, ChevronRight, Search, X, Star, CheckCircle2, Tags 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';

export default function ShopHomePage() {
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchAllStoreData();
  }, []);

  async function fetchAllStoreData() {
    setLoading(true);
    try {
      // Fetch everything: Variants + Products + Brands in one big request
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products (
            name,
            category,
            brand_id,
            brands (
              name
            )
          )
        `);

      if (error) throw error;

      if (data) {
        setAllVariants(data);
        
        // Extract unique Categories and Brands from the data we just downloaded
        const uniqueCats = Array.from(new Set(data.map(v => v.products?.category))).filter(Boolean).sort() as string[];
        const uniqueBrands = Array.from(new Set(data.map(v => v.products?.brands?.name))).filter(Boolean).sort() as string[];
        
        setCategories(uniqueCats);
        setBrands(uniqueBrands);
      }
    } catch (err) {
      console.error("Critical Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // THE FILTERING ENGINE (Calculates instantly whenever state changes)
  const filteredProducts = useMemo(() => {
    return allVariants.filter(v => {
      const matchesCat = !selectedCat || v.products?.category === selectedCat;
      const matchesBrand = !selectedBrand || v.products?.brands?.name === selectedBrand;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        v.part_number?.toLowerCase().includes(searchLower) ||
        v.sku?.toLowerCase().includes(searchLower) ||
        v.products?.name?.toLowerCase().includes(searchLower);

      return matchesCat && matchesBrand && matchesSearch;
    });
  }, [allVariants, selectedCat, selectedBrand, searchTerm]);

  return (
    <div className="flex gap-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      
      {/* SIDEBAR */}
      <aside className="w-64 hidden md:block shrink-0 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-28 shadow-sm">
          
          {/* Category Section */}
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Filter size={16} className="text-blue-600" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest">Categories</h3>
          </div>
          <ul className="space-y-1 mb-8">
            <li 
              onClick={() => setSelectedCat(null)}
              className={clsx(
                "px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all active:scale-95",
                !selectedCat ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              All Items
            </li>
            {categories.map((cat) => (
              <li 
                key={cat} 
                onClick={() => setSelectedCat(cat)}
                className={clsx(
                  "px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all flex justify-between items-center active:scale-95",
                  selectedCat === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                )}
              >
                {cat}
                {selectedCat === cat && <ChevronRight size={12}/>}
              </li>
            ))}
          </ul>

          {/* Brand Section */}
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-t border-slate-100 pt-6">
            <Tags size={16} className="text-orange-500" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest">Brands</h3>
          </div>
          <ul className="space-y-1">
            <li 
              onClick={() => setSelectedBrand(null)}
              className={clsx(
                "px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all active:scale-95",
                !selectedBrand ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              All Brands
            </li>
            {brands.map((brand) => (
              <li 
                key={brand} 
                onClick={() => setSelectedBrand(brand)}
                className={clsx(
                  "px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all flex justify-between items-center active:scale-95",
                  selectedBrand === brand ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-orange-600"
                )}
              >
                {brand}
                {selectedBrand === brand && <ChevronRight size={12}/>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 space-y-6">
        
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <Search size={20} className="text-slate-400" />
           <input 
              type="text" 
              placeholder="Instant Search Part Number or Description..." 
              className="w-full bg-transparent outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           {searchTerm && <X size={18} className="text-slate-300 cursor-pointer" onClick={() => setSearchTerm("")} />}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Spinner size={40} className="text-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Synchronizing Inventory...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight italic uppercase">
                    {selectedCat || "Catalog"} {selectedBrand && `| ${selectedBrand}`}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Showing {filteredProducts.length} items from warehouse
                  </p>
               </div>
               {(selectedCat || selectedBrand) && (
                 <button 
                  onClick={() => { setSelectedCat(null); setSelectedBrand(null); }}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tighter active:scale-95"
                 >
                   Reset Filters
                 </button>
               )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-100">
                 <Package size={64} className="mx-auto text-slate-100 mb-6" />
                 <h3 className="text-lg font-bold text-slate-800 uppercase italic tracking-tighter">Item Not Found</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Try a different filter combination</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((v) => {
                  const isStockOut = (v.stock_quantity || 0) <= 0;
                  const price = v.price_online > 0 ? v.price_online : v.price_myr;

                  return (
                    <div key={v.id} className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500 transition-all duration-300 group flex flex-col h-full relative overflow-hidden shadow-sm hover:shadow-xl">
                      <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative border-b border-slate-100">
                        <Package size={60} strokeWidth={1} className="text-slate-200 group-hover:scale-110 transition-transform duration-700" />
                        {isStockOut && (
                           <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 font-bold uppercase text-[10px] tracking-widest">
                              Out of Stock
                           </div>
                        )}
                        <div className="absolute top-4 left-4 z-20">
                           <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-bold text-blue-600 border border-slate-100 uppercase tracking-tighter shadow-sm">
                              {v.products?.brands?.name || 'GENUINE'}
                           </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-slate-800 line-clamp-2 h-12 leading-tight mb-1 uppercase italic tracking-tighter">
                          {v.part_number}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
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
                                <div className="flex items-center gap-1 mt-1 text-green-600">
                                   <CheckCircle2 size={12}/>
                                   <span className="text-[9px] font-bold uppercase tracking-widest italic">In Stock</span>
                                </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); addToCart(v.id); }}
                              disabled={isStockOut}
                              className="bg-[#2563EB] text-white p-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 hover:bg-blue-700 transition-all disabled:opacity-30"
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