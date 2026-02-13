"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Archive, ExternalLink } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import ProductModal from '@/components/ProductModal';

const BRANDS = ["All Parts", "4FLEX", "FTuned", "Grantt", "Kayaba", "Powerbrake", "Proride"];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All Parts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchInventory(); }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data } = await supabase
      .from('products_flat')
      .select('*, categories(name)')
      .eq('is_archived', false)
      .order('part_number', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  }

  const filteredItems = items.filter(item => {
    const matchesBrand = selectedBrand === "All Parts" || item.brand === selectedBrand;
    const matchesSearch = item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Inventory Master</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1 shadow-sm uppercase">
          <Plus size={14} strokeWidth={3} /> Add New Item
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search Code, SKU or Model..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {BRANDS.map(brand => (
             <button key={brand} onClick={() => setSelectedBrand(brand)} className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all border uppercase tracking-wider active:scale-95 ${selectedBrand === brand ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-gray-200 hover:bg-gray-50"}`}>
               {brand}
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
                <th className="px-4 py-3 text-right">Prop</th>
                <th className="px-4 py-3 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Spinner /></td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-800 uppercase">{item.part_number}</td>
                  <td className="px-4 py-2.5">
                     <div className="font-semibold text-slate-700 uppercase tracking-tight line-clamp-1">{item.name}</div>
                     <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.item_code} • {item.brand} • {item.model_name}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-500 font-mono">RM {Number(item.cost_rm).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#2563EB] font-mono">{Number(item.price_myr).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-600 font-mono">{Number(item.price_online).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 font-mono">{Number(item.price_proposal).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${item.stock_quantity < item.min_stock_level ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {item.stock_quantity}
                    </div>
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