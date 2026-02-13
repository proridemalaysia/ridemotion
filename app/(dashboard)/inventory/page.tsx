"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, RotateCw } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

const BRANDS = ["All Parts", "4FLEX", "FTuned", "Grantt", "Kayaba", "Powerbrake", "Proride"];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All Parts");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data } = await supabase
      .from('product_variants')
      .select('*, products(*)')
      .order('sku', { ascending: true });
    
    if (data) setItems(data);
    setLoading(false);
  }

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesBrand = selectedBrand === "All Parts" || item.products?.brand_name === selectedBrand;
    const matchesSearch = item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Inventory Management</h2>
        <button className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm uppercase">
          <Plus size={14} strokeWidth={3} /> Add New Item
        </button>
      </div>

      {/* Toolbar: Search + Brand Pills */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search Code, SKU or Model..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {BRANDS.map(brand => (
             <button 
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider ${
                  selectedBrand === brand 
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md" 
                    : "bg-white text-slate-500 border-gray-200 hover:bg-gray-50"
                }`}
             >
               {brand}
             </button>
           ))}
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Product Description</th>
                <th className="px-4 py-3 text-right">Cost (USD)</th>
                <th className="px-4 py-3 text-right">Cost (RM)</th>
                <th className="px-4 py-3 text-right">Sell</th>
                <th className="px-4 py-3 text-right">Online</th>
                <th className="px-4 py-3 text-right">Prop</th>
                <th className="px-4 py-3 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center"><Spinner /></td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-slate-400 font-medium italic">No parts found matching your criteria.</td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 tracking-tighter uppercase">{item.sku}</td>
                  <td className="px-4 py-3">
                     <div className="font-semibold text-slate-700 uppercase tracking-tight line-clamp-1">{item.products?.name}</div>
                     <div className="text-[10px] text-slate-400 font-medium uppercase">{item.position || 'N/A'} • {item.variant_type || 'STD'}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 font-mono italic">
                    {item.buy_usd ? `$${Number(item.buy_usd).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-500 font-mono">
                    RM {Number(item.cost_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#2563EB] font-mono">
                    {Number(item.price_sell).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-600 font-mono">
                    {Number(item.price_online).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 font-mono">
                    {Number(item.price_proposal || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`inline-flex flex-col items-center justify-center px-3 py-1 rounded text-[11px] font-bold min-w-[45px] ${
                      item.stock_quantity < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                    }`}>
                      {item.stock_quantity}
                      <span className="text-[8px] opacity-60 font-medium uppercase mt-0.5">Ratio: {item.packing_ratio}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}