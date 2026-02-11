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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_variants?.[0]?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex gap-8">
      {/* Sidebar Filter */}
      <aside className="w-64 hidden md:block shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-28 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <Filter size={14} className="text-orange-500" /> Categories
          </h3>
          
          <div className="relative mb-4">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
             <input 
                type="text" 
                placeholder="Search catalog..." 
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <ul className="space-y-1">
            <li 
              onClick={() => setSelectedCat(null)}
              className={clsx(
                "px-3 py-2 rounded text-sm cursor-pointer transition-colors",
                !selectedCat ? "bg-orange-50 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              All Products
            </li>
            {categories.map((cat) => (
              <li 
                key={cat.id} 
                onClick={() => setSelectedCat(cat.id)}
                className={clsx(
                  "px-3 py-2 rounded text-sm cursor-pointer transition-colors flex justify-between items-center",
                  selectedCat === cat.id ? "bg-orange-50 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                )}
              >
                {cat.name}
                {selectedCat === cat.id && <ChevronRight size={12}/>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Product Grid Area */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <Spinner size={32} className="text-orange-500" />
            <p className="text-gray-400 text-xs font-medium">Updating catalog...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
               <h2 className="text-xl font-bold text-gray-800">
                {selectedCat ? categories.find(c => c.id === selectedCat)?.name : 'All Spare Parts'}
               </h2>
               <p className="text-xs text-gray-500 mt-1">Showing {filteredProducts.length} items available in stock</p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-20 text-center border border-gray-200">
                 <Package size={48} className="mx-auto text-gray-200 mb-4" />
                 <h3 className="text-lg font-semibold text-gray-700">No results found</h3>
                 <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const variant = product.product_variants?.[0];
                  const isStockOut = (variant?.stock_quantity || 0) <= 0;

                  return (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 hover:border-orange-400 transition-all group flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md">
                      {/* Image Container */}
                      <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt={product.name}
                          />
                        ) : (
                          <Package size={40} className="text-gray-200" />
                        )}
                        
                        {isStockOut && (
                           <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                              <span className="px-3 py-1 bg-gray-800 text-white font-bold text-[10px] uppercase rounded">Sold Out</span>
                           </div>
                        )}

                        <div className="absolute top-2 left-2">
                           <span className="bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 border border-gray-200 uppercase">
                              {product.brand_name || 'GENUINE'}
                           </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 h-10 mb-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-mono mb-4 uppercase tracking-tighter">SKU: {variant?.sku}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-orange-600 font-bold text-lg">RM {variant?.price_online?.toFixed(2)}</span>
                                <div className="flex items-center gap-1">
                                   <Star size={10} className="text-amber-400 fill-amber-400"/>
                                   <span className="text-[10px] text-gray-400 font-medium">Ready Stock</span>
                                </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); addToCart(variant.id); }}
                              disabled={isStockOut}
                              className="bg-orange-500 text-white p-2.5 rounded-lg shadow-sm active:scale-95 hover:bg-orange-600 transition-all disabled:opacity-30"
                            >
                              <ShoppingCart size={18} />
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