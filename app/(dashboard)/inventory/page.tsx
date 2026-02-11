"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Search, Plus, RotateCw, Save, Edit3, Trash2, Archive, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import ProductModal from '@/components/ProductModal';
import { Spinner } from '@/components/Spinner';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>({});

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`*, product_variants (*)`)
      .eq('is_archived', false) // Only show active items
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this part? It will be hidden from the storefront but remain in sales history.")) return;
    await supabase.from('products').update({ is_archived: true }).eq('id', id);
    fetchProducts();
  };

  const handlePriceChange = (variantId: string, field: string, value: string) => {
    setPendingChanges({ ...pendingChanges, [variantId]: { ...pendingChanges[variantId], [field]: parseFloat(value) } });
  };

  const saveBulkChanges = async () => {
    setLoading(true);
    for (const variantId in pendingChanges) {
      await supabase.from('product_variants').update(pendingChanges[variantId]).eq('id', variantId);
    }
    setPendingChanges({});
    setEditMode(false);
    fetchProducts();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Master Stock</h2>
          <p className="text-slate-400 text-sm font-medium">Control your catalog visibility and pricing</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditMode(!editMode)} className={clsx("px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg", editMode ? "bg-amber-500 text-white shadow-amber-100" : "bg-white border-2 border-slate-900 text-slate-900")}>
            <Edit3 size={20} /> {editMode ? 'CANCEL EDIT' : 'PRICE MODE'}
          </button>
          {editMode ? (
            <button onClick={saveBulkChanges} className="bg-green-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-100">
              <Save size={20} /> COMMIT CHANGES
            </button>
          ) : (
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100">
              <Plus size={24} /> NEW PART
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b bg-gray-50/50">
                <th className="px-8 py-5">Item Identity</th>
                <th className="px-6 py-5 text-center">Stock Level</th>
                <th className="px-6 py-5">POS RM</th>
                <th className="px-6 py-5">ONLINE RM</th>
                <th className="px-8 py-5 text-right">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && products.length === 0 ? (
                <tr><td colSpan={5} className="py-32 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : products.map((p) => {
                const variant = p.product_variants?.[0];
                return (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                      <div className="text-[10px] font-black text-blue-600 tracking-tighter uppercase italic">{variant?.sku} • {p.brand_name}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase", variant?.stock_quantity < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                        {variant?.stock_quantity} In-Bin
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">
                       {editMode ? <input type="number" defaultValue={variant?.price_sell} className="w-24 p-2 border rounded-lg text-xs font-black" onChange={(e) => handlePriceChange(variant.id, 'price_sell', e.target.value)} /> : `RM ${variant?.price_sell?.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-5 font-black text-orange-600">
                       {editMode ? <input type="number" defaultValue={variant?.price_online} className="w-24 p-2 border rounded-lg text-xs font-black" onChange={(e) => handlePriceChange(variant.id, 'price_online', e.target.value)} /> : `RM ${variant?.price_online?.toFixed(2)}`}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button onClick={() => handleArchive(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Archive Part">
                          <Archive size={18} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchProducts} />
    </div>
  );
}