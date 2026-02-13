"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, RotateCw } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import ProductModal from '@/components/ProductModal';

const BRANDS = ["All Parts", "4FLEX", "FTuned", "Grantt", "Kayaba", "Powerbrake", "Proride"];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
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
          <input type="text" placeholder="Search Code, SKU or Model..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {BRANDS.map(brand => (
             <button 
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all border uppercase tracking-wider active:scale-95 ${
                  selectedBrand === brand ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-gray-200 hover:bg-gray-50"
                }`}
             >
               {brand}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">No items found.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-800 tracking-tight">{item.sku}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-600 uppercase tracking-tight line-clamp-1">{item.products?.name}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 font-medium">RM {item.cost_price?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#2563EB]">RM {item.price_sell?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-600">RM {item.price_online?.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold ${item.stock_quantity < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {item.stock_quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchInventory} />
    </div>
  );
}