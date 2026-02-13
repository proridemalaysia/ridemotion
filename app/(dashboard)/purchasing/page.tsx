"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Plus, Search, Calendar, PackageCheck, Users } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import StockInModal from '@/components/StockInModal';

const TABS = ["Purchase Orders", "Suppliers"];

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState("Purchase Orders");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    setLoading(true);
    const { data } = await supabase
      .from('purchases')
      .select(`*, purchase_items (*, product_variants (sku, products (name)))`)
      .order('created_at', { ascending: false });
    
    if (data) setPurchases(data);
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* Horizontal Sub-Tabs (Reference Style) */}
      <div className="flex items-center gap-8 border-b border-slate-200 mb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[13px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tight">{activeTab}</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm uppercase"
        >
          <Plus size={14} strokeWidth={3} /> New Purchase Order
        </button>
      </div>

      {/* High-Density Purchase Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Ref No</th>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-medium italic uppercase tracking-widest">No purchase orders found. Click "New Purchase Order" to start.</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-5 py-3 text-slate-500 font-medium">{new Date(p.created_at).toLocaleDateString('en-MY')}</td>
                  <td className="px-5 py-3 font-bold text-slate-800 uppercase tracking-tighter">{p.reference_no}</td>
                  <td className="px-5 py-3 font-semibold text-slate-600 uppercase">{p.supplier_name}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border border-green-100 tracking-tighter">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900 font-mono">
                    RM {Number(p.total_amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StockInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPurchases} />
    </div>
  );
}