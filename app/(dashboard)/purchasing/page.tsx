"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Plus, Calendar, PackageCheck, History, Search } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import StockInModal from '@/components/StockInModal';

export default function PurchasingPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    const { data } = await supabase
      .from('purchases')
      .select(`*, purchase_items (*, product_variants (sku, products (name)))`)
      .order('created_at', { ascending: false });
    
    if (data) setPurchases(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Purchasing & Stock In</h2>
          <p className="text-slate-500 text-sm">Manage incoming inventory and supplier invoices</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          New Stock In
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Monthly Spend</p>
          <h3 className="text-2xl font-bold text-slate-900">
            RM {purchases.reduce((acc, p) => acc + Number(p.total_amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Shipments</p>
            <h3 className="text-xl font-bold text-slate-900">{purchases.length} Received</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier / Reference</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total Cost</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400">Loading records...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-medium">No purchase records found</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{p.supplier_name}</div>
                    <div className="text-xs text-blue-600 font-mono uppercase">{p.reference_no}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {p.purchase_items?.length} items
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    RM {Number(p.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[11px] font-semibold uppercase border border-green-100">
                      {p.status}
                    </span>
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