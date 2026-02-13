"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Plus, Search, Eye, Globe, Store, Clock, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import POSModal from '@/components/POSModal';
import SaleDetailModal from '@/components/SaleDetailModal';
import { clsx } from 'clsx';

export default function SalesDashboard() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    fetchSales();
    const channel = supabase.channel('sales-realtime')
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
    <div className="p-8 space-y-6 animate-in fade-in duration-500 print:hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Sales History</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Counter & Online Transactions</p>
        </div>
        <button 
          onClick={() => setIsPOSOpen(true)}
          className="bg-[#2563EB] text-white px-4 py-2 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm uppercase tracking-wide"
        >
          <Plus size={16} strokeWidth={3} /> New Counter Sale
        </button>
      </div>

      {/* High-Density Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
           <div className="relative max-w-sm">
             <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Search Order ID or Customer..." className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Order Ref</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3 text-center">Channel</th>
                <th className="px-5 py-3 text-right">Total Amount</th>
                <th className="px-5 py-3 text-center">Fulfillment</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading && sales.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center"><Spinner /></td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-5 py-3 font-bold text-slate-900 tracking-tight uppercase">#ORD-{sale.order_number}</td>
                  <td className="px-5 py-3 text-slate-500 font-medium">
                    {new Date(sale.created_at).toLocaleDateString('en-MY')} 
                    <span className="ml-2 text-[10px] opacity-60">{new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={clsx(
                      "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter",
                      sale.source === 'online' ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-blue-50 text-blue-600 border-blue-200"
                    )}>
                      {sale.source === 'online' ? <Globe size={10} className="inline mr-1 mb-0.5" /> : <Store size={10} className="inline mr-1 mb-0.5" />}
                      {sale.source}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800 font-mono tracking-tighter">
                    RM {Number(sale.total_amount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={clsx(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest inline-flex items-center gap-1",
                      sale.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-green-50 text-green-600 border-green-200"
                    )}>
                      {sale.status === 'pending' ? <Clock size={10}/> : <CheckCircle size={10}/>}
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="text-[#2563EB] hover:text-blue-800 font-bold uppercase text-[10px] tracking-widest transition-colors"
                    >
                      Manage
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