"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, Filter, Package, ChevronRight, Search, X, Star, Tags 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export default function ShopHomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    setLoading(true);
    try {
      // Fetch Products joined with their child Variants and parent Brands
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (name),
          product_variants (*)
        `)
        .eq('is_published', true)
        .eq('is_archived', false);

      if (error) throw error;

      if (data) {
        setProducts(data);
        setCategories(Array.from(new Set(data.map(p => p.category))).filter(Boolean).sort() as string[]);
        setBrands(Array.from(new Set(data.map(p => p.brands?.name))).filter(Boolean).sort() as string[]);
      }
    } catch (err) {
      console.error("Storefront Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = !selectedCat || p.category === selectedCat;
      const matchesBrand = !selectedBrand || p.brands?.name === selectedBrand;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        p.name?.toLowerCase().includes(searchLower) ||
        p.brands?.name?.toLowerCase().includes(searchLower) ||
        p.product_variants?.some((v: any) => v.item_code?.toLowerCase().includes(searchLower));

      return matchesCat && matchesBrand && matchesSearch;
    });
  }, [products, selectedCat, selectedBrand, searchTerm]);

  return (
    <div className="flex gap-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      
      <aside className="w-64 hidden md:block shrink-0 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-28 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Filter size={16} className="text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Categories</span>
          </div>
          <ul className="space-y-1 mb-8">
            <li onClick={() => setSelectedCat(null)} className={clsx("px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all active:scale-95", !selectedCat ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50")}>All Categories</li>
            {categories.map(cat => <li key={cat} onClick={() => setSelectedCat(cat)} className={clsx("px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all flex justify-between items-center active:scale-95", selectedCat === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600")}>{cat} {selectedCat === cat && <ChevronRight size={12}/>}</li>)}
          </ul>

          <div className="flex items-center gap-2 mb-4 text-slate-800 border-t border-slate-100 pt-6">
            <Tags size={16} className="text-orange-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Brands</span>
          </div>
          <ul className="space-y-1">
            <li onClick={() => setSelectedBrand(null)} className={clsx("px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all active:scale-95", !selectedBrand ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50")}>All Brands</li>
            {brands.map(brand => <li key={brand} onClick={() => setSelectedBrand(brand)} className={clsx("px-3 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all flex justify-between items-center active:scale-95", selectedBrand === brand ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-orange-600")}>{brand} {selectedBrand === brand && <ChevronRight size={12}/>}</li>)}
          </ul>
        </div>
      </aside>

      <div className="flex-1 space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <Search size={20} className="text-slate-400" />
           <input type="text" placeholder="Search vehicle (e.g. Alza, Saga)..." className="w-full bg-transparent outline-none text-sm font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4"><Spinner size={40} className="text-blue-600" /><p className="text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Bundling Inventory...</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              // Calculate "Starting From" price (Cheapest variant x 2)
              const basePrice = Math.min(...p.product_variants.map((v: any) => v.price_online || v.price_myr)) * 2;

              return (
                <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="bg-white rounded-[32px] border border-slate-200 hover:border-blue-500 transition-all duration-300 group flex flex-col h-full relative overflow-hidden shadow-sm hover:shadow-xl cursor-pointer">
                  <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative border-b border-slate-100 overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Product" />
                    ) : (
                      <Package size={60} strokeWidth={1} className="text-slate-200" />
                    )}
                    <div className="absolute top-4 left-4"><span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-bold text-blue-600 border border-slate-100 uppercase tracking-tighter">{p.brands?.name || 'GENUINE'}</span></div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-800 line-clamp-2 h-12 leading-tight mb-1 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category} System</p>
                    
                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Starting From</span>
                            <div className="text-blue-600 flex items-baseline gap-0.5">
                                <span className="text-xs font-bold italic">RM</span>
                                <span className="text-2xl font-black tracking-tighter italic">{basePrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}