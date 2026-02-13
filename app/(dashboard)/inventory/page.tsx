"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import ProductModal from '@/components/ProductModal';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All Parts");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch Brands for the Filter Pills
    const { data: brandData } = await supabase.from('brands').select('*').order('name');
    if (brandData) setBrands(brandData);

    // Fetch Variants joined with Products and Brands
    const { data: variantData } = await supabase
      .from('product_variants')
      .select(`
        *,
        products (
          name,
          category,
          brands (name)
        )
      `)
      .order('sku', { ascending: true });
    
    if (variantData) setItems(variantData);
    setLoading(false);
  }

  const filteredItems = items.filter(item => {
    const itemBrand = item.products?.brands?.name || "";
    const matchesBrand = selectedBrand === "All Parts" || itemBrand === selectedBrand;
    const matchesSearch = item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.part_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Inventory Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1 shadow-sm uppercase"
        >
          <Plus size={14} strokeWidth={3} /> Add New Item
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search SKU, Part No or Model..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <button 
              onClick={() => setSelectedBrand("All Parts")}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all border uppercase ${
                selectedBrand === "All Parts" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-gray-200"
              }`}
           >
             All Parts
           </button>
           {brands.map(b => (
             <button 
                key={b.id}
                onClick={() => setSelectedBrand(b.name)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all border uppercase ${
                  selectedBrand === b.name ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-gray-200 hover:bg-gray-50"
                }`}
             >
               {b.name}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Product Description</th>
                <th className="px-4 py-3 text-right">Cost (RM)</th>
                <th className="px-4 py-3 text-right">Sell</th>
                <th className="px-4 py-3 text-right">Online</th>
                <th className="px-4 py-3 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Spinner /></td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 tracking-tighter uppercase">{item.sku}</td>
                  <td className="px-4 py-3">
                     <div className="font-semibold text-slate-700 uppercase tracking-tight line-clamp-1">
                        {item.products?.name} {item.part_number}
                     </div>
                     <div className="text-[10px] text-slate-400 font-medium uppercase">
                        {item.products?.brands?.name} • {item.position} • {item.type}
                     </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-500 font-mono">
                    RM {Number(item.cost_rm || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#2563EB] font-mono">
                    RM {Number(item.price_myr || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-600 font-mono">
                    RM {Number(item.price_online || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`inline-flex flex-col items-center justify-center px-3 py-0.5 rounded text-[10px] font-bold min-w-[40px] ${
                      item.stock_quantity < item.min_stock_level ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                    }`}>
                      {item.stock_quantity}
                      <span className="text-[8px] opacity-60 font-medium uppercase">Ratio: {item.packing_ratio}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}