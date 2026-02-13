"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Filter, Package, ChevronRight, Search, X, Star } from 'lucide-react';
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
    try {
      // Step A: Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      // Step B: Build Product Query
      let query = supabase
        .from('products_flat')
        .select('*') // Removed join temporarily to ensure raw data appears
        .eq('is_published', true)
        .eq('is_archived', false);
      
      if (selectedCat) {
        query = query.eq('category_id', selectedCat);
      }

      const { data: prodData, error: prodError } = await query.order('part_number', { ascending: true });

      if (prodError) throw prodError;
      if (prodData) setProducts(prodData);
      
    } catch (err) {
      console.error("Storefront Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Search Filtering on client side
  const filteredProducts = products.filter(p => 
    p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Sidebar Filter */}
      <aside className="w-64 hidden md:block shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-28 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Filter size={14} className="text-blue-600" /> Browse Catalog
          </h3>
          
          <div className="relative mb-4">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
             <input 
                type="text" 
                placeholder="Search parts..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <ul className="space-y-1">
            <li 
              onClick={() => setSelectedCat(null)}
              className={clsx(
                "px-3 py-2 rounded-lg text-sm cursor-pointer transition-all",
                !selectedCat ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              All Products
            </li>
            {categories.map((cat) => (
              <li 
                key={cat.id} 
                onClick={() => setSelectedCat(cat.id)}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex justify-between items-center",
                  selectedCat === cat.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                )}
              >
                {cat.name}
                {selectedCat === cat.id && <ChevronRight size={12}/>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3 text-slate-400">
            <Spinner size={32} />
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Warehouse Data...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedCat ? categories.find(c => c.id === selectedCat)?.name : 'Warehouse Catalog'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Available Inventory: {filteredProducts.length} items</p>
               </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[32px] p-24 text-center border-2 border-dashed border-slate-100">
                 <Package size={64} className="mx-auto text-slate-100 mb-6" />
                 <h3 className="text-lg font-bold text-slate-800 uppercase italic">Catalog is Empty</h3>
                 <p className="text-slate-400 text-sm mt-2 font-medium">Ensure products are published and Row Level Security is disabled in Supabase.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isStockOut = (product.stock_quantity || 0) <= 0;

                  return (
                    <div key={product.id} className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 transition-all group flex flex-col h-full overflow-hidden shadow-sm hover:shadow-lg">
                      {/* Image Container */}
                      <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative border-b border-slate-100">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt={product.name || product.part_number}
                          />
                        ) : (
                          <Package size={48} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                        )}
                        
                        {isStockOut && (
                           <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="px-3 py-1 bg-slate-800 text-white font-bold text-[10px] uppercase rounded tracking-widest">No Stock</span>
                           </div>
                        )}
                        <div className="absolute top-3 left-3">
                           <span className="bg-white/95 px-2.5 py-1 rounded-lg text-[9px] font-bold text-blue-600 border border-slate-100 uppercase tracking-tighter shadow-sm">
                              {product.brand || 'GENUINE'}
                           </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 h-10 mb-1 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">
                          {product.part_number}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 line-clamp-1 mb-4 uppercase">{product.model_name || 'Multi-Vehicle'}</p>
                        
                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-blue-600 font-bold text-xl italic tracking-tighter">RM {Number(product.price_online || product.price_myr).toFixed(2)}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                   <Star size={10} className="text-amber-400 fill-amber-400"/>
                                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ready Stock</span>
                                </div>
                            </div>
                            <button 
                              onClick={() => addToCart(product.id)}
                              disabled={isStockOut}
                              className="bg-[#2563EB] text-white p-3 rounded-xl shadow-lg shadow-blue-100 active:scale-95 hover:bg-blue-700 transition-all disabled:opacity-30"
                            >
                              <ShoppingCart size={20} strokeWidth={2.5} />
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