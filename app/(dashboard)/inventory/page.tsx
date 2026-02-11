"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

const BRANDS = ["All Parts", "4FLEX", "FTuned", "Grantt", "Kayaba", "Powerbrake", "Proride"];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All Parts");

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data } = await supabase.from('product_variants').select('*, products(*)').order('sku');
    if (data) setItems(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-[12px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm">
          <Plus size={14} /> Add New Item
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search Code, SKU or Model..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-500" 
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {BRANDS.map(brand => (
             <button 
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all border",
                  selectedBrand === brand ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-gray-200 hover:bg-gray-50"
                )}
             >
               {brand}
             </button>
           ))}
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-800 tracking-tight">{item.sku}</td>
                  <td className="px-4 py-2.5">
                     <div className="font-medium text-slate-700 uppercase tracking-tight line-clamp-1">{item.products?.name}</div>
                     <div className="text-[10px] text-slate-400 font-medium uppercase">{item.position} • {item.products?.brand_name}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-400 italic">${item.buy_usd || '-'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-500">RM {item.cost_price?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-blue-700">RM {item.price_sell?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-600">{item.price_online?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400">{item.price_proposal?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className={clsx(
                      "inline-flex flex-col items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold min-w-[30px]",
                      item.stock_quantity < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                    )}>
                      {item.stock_quantity}
                      <span className="text-[8px] opacity-60 font-normal">Ratio: {item.packing_ratio}</span>
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

const clsx = (...classes: any) => classes.filter(Boolean).join(' ');