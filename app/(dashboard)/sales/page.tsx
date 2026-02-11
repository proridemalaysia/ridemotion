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
    
    // FIXED: Added schema: 'public' to satisfy TypeScript
    const channel = supabase
      .channel('sales-sync')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sales' 
        }, 
        () => fetchSales()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchSales() {
    const { data } = await supabase
      .from('sales')
      .select(`*, sale_items (*, product_variants (*))`)
      .order('created_at', { ascending: false });
    
    if (data) setSales(data);
    setLoading(false);
  }

  const revenue = sales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 print:hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Sales & Orders</h2>
          <p className="text-slate-400 text-sm font-medium">Manage walk-ins and fulfillment</p>
        </div>
        <button 
          onClick={() => setIsPOSOpen(true)}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
        >
          <Plus size={24} /> NEW WALK-IN SALE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Sales Volume</p>
          <h3 className="text-3xl font-black text-blue-400 italic mt-1">RM {revenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Online Orders</p>
           <h3 className="text-3xl font-black text-slate-800 mt-1">{sales.filter(s => s.source === 'online').length}</h3></div>
           <Globe size={40} className="text-orange-100" />
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">POS Sales</p>
           <h3 className="text-3xl font-black text-slate-800 mt-1">{sales.filter(s => s.source === 'walk-in').length}</h3></div>
           <Store size={40} className="text-blue-100" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
           <div className="relative w-72">
             <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Search order ID..." className="w-full pl-10 pr-4 py-2 rounded-xl border-none bg-white text-xs font-bold" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-6 py-5">Source</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-800">#ORD-{sale.order_number}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(sale.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "text-[9px] font-black px-2 py-1 rounded-md border uppercase",
                      sale.source === 'online' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {sale.source}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-800 italic">RM {Number(sale.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "text-[9px] font-black px-2 py-1 rounded-full border uppercase flex items-center gap-1 w-fit",
                      sale.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-green-50 text-green-600 border-green-200"
                    )}>
                      <Clock size={10}/> {sale.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                    >
                      <Eye size={20} />
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