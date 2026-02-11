"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Search, Plus, RotateCw, Save, Edit3, Archive } from 'lucide-react';
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
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Master</h2>
          <p className="text-slate-500 text-sm">Manage parts, prices, and stock levels</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setEditMode(!editMode)}
            className={clsx(
              "px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2",
              editMode ? "bg-amber-100 text-amber-700" : "bg-white border border-gray-300 text-slate-700 hover:bg-gray-50"
            )}
          >
            <Edit3 size={16} /> {editMode ? 'Cancel Edit' : 'Edit Prices'}
          </button>
          
          {editMode ? (
            <button onClick={saveBulkChanges} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-all flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
          ) : (
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
              <Plus size={16} /> Add Part
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
           <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input type="text" placeholder="Search SKU, Name..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
           </div>
           <button onClick={fetchProducts} className="p-2 text-gray-400 hover:text-blue-600"><RotateCw size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3">Retail (RM)</th>
                <th className="px-6 py-3">Online (RM)</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && products.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400">Loading inventory...</td></tr>
              ) : products.map((p) => {
                const variant = p.product_variants?.[0];
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.brand_name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{variant?.sku}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[11px] font-semibold",
                        variant?.stock_quantity < 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>
                        {variant?.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       {editMode ? (
                         <input type="number" defaultValue={variant?.price_sell} className="w-20 p-1 border rounded text-xs" onChange={(e) => handlePriceChange(variant.id, 'price_sell', e.target.value)} />
                       ) : (
                         `RM ${variant?.price_sell?.toFixed(2)}`
                       )}
                    </td>
                    <td className="px-6 py-4">
                       {editMode ? (
                         <input type="number" defaultValue={variant?.price_online} className="w-20 p-1 border rounded text-xs" onChange={(e) => handlePriceChange(variant.id, 'price_online', e.target.value)} />
                       ) : (
                         `RM ${variant?.price_online?.toFixed(2)}`
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-red-600"><Archive size={16} /></button>
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