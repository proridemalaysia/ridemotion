"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Globe, Store, Clock, CheckCircle, Plus, Eye, Search } from 'lucide-react';
import { clsx } from 'clsx';
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
    const { data } = await supabase
      .from('sales')
      .select(`*, sale_items (*, product_variants (*))`)
      .order('created_at', { ascending: false });
    if (data) setSales(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6 print:hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales & Orders</h2>
          <p className="text-slate-500 text-sm">Monitor hybrid revenue from counter and online store</p>
        </div>
        <button 
          onClick={() => setIsPOSOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> New Walk-in Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase mb-1">Daily Volume</p>
          <h3 className="text-2xl font-bold text-slate-900">
            RM {sales.reduce((acc, s) => acc + Number(s.total_amount), 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-xs font-medium uppercase">Online Orders</p>
             <h3 className="text-2xl font-bold text-slate-800">{sales.filter(s => s.source === 'online').length}</h3>
           </div>
           <Globe size={24} className="text-slate-300" />
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-xs font-medium uppercase">Walk-in Sales</p>
             <h3 className="text-2xl font-bold text-slate-800">{sales.filter(s => s.source === 'walk-in').length}</h3>
           </div>
           <Store size={24} className="text-slate-300" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
           <div className="relative w-72">
             <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
             <input type="text" placeholder="Search order ID..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3 text-center">Channel</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center"><Spinner /></td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    #ORD-{sale.order_number}
                    <div className="text-[11px] text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      "text-[10px] font-semibold px-2 py-0.5 rounded border uppercase",
                      sale.source === 'online' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {sale.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">RM {Number(sale.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase inline-flex items-center gap-1",
                      sale.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-green-50 text-green-600 border-green-100"
                    )}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye size={18} />
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