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
    <div className="space-y-6">
      {/* Sub-Tabs Navigation (Reference Style) */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[13px] font-medium transition-all relative ${
              activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{activeTab}</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-[12px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus size={14} /> New Purchase Order
        </button>
      </div>

      {/* High-Density Purchase Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Ref No</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic font-medium">No purchase orders found. Click "New Purchase Order" to start.</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500">{new Date(p.created_at).toLocaleDateString('en-MY')}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-700 uppercase tracking-tight">{p.reference_no}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-600">{p.supplier_name}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-100">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900">
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