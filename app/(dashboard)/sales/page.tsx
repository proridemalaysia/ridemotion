"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Globe, Store, Clock, CheckCircle, Plus, Eye, Search } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import POSModal from '@/components/POSModal';
import SaleDetailModal from '@/components/SaleDetailModal';

export default function SalesDashboard() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    fetchSales();
    const channel = supabase.channel('sales-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchSales())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data } = await supabase
      .from('sales')
      .select(`*, sale_items (*, product_variants (*))`)
      .order('created_at', { ascending: false });
    if (data) setSales(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Sales History</h2>
        <button 
          onClick={() => setIsPOSOpen(true)}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-[12px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus size={14} /> New Counter Sale
        </button>
      </div>

      {/* High-Density Sales List */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Channel</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Fulfillment</th>
                <th className="px-4 py-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Spinner /></td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-800 tracking-tight">#ORD-{sale.order_number}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-medium">{new Date(sale.created_at).toLocaleDateString('en-MY')}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      sale.source === 'online' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                      {sale.source}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900 italic">RM {Number(sale.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${
                      sale.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-green-50 text-green-600 border-green-100"
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="text-blue-600 hover:text-blue-800 font-semibold uppercase text-[10px] tracking-widest"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <POSModal isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} onSuccess={fetchSales} />
      <SaleDetailModal sale={selectedSale} isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} onRefresh={fetchSales} />
    </div>
  );
}