"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Plus, Package, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Spinner } from '@/components/Spinner';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ revenue: 0, lowStockCount: 0 });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: sales } = await supabase.from('sales').select('total_amount');
      // Updated query for flat table
      const { data: lowStock } = await supabase
        .from('products_flat')
        .select('*')
        .lte('stock_quantity', 5)
        .eq('is_archived', false)
        .limit(5);

      if (sales) setStats(prev => ({ ...prev, revenue: sales.reduce((acc, s) => acc + Number(s.total_amount), 0) }));
      if (lowStock) {
        setStats(prev => ({ ...prev, lowStockCount: lowStock.length }));
        setLowStockItems(lowStock);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center"><Spinner /></div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Live Operations View</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Sales Revenue" value={`RM ${stats.revenue.toFixed(2)}`} sub="TODAY" icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="To Collect (Customers)" value="RM 0.00" sub="PENDING" icon={DollarSign} color="text-green-600" bg="bg-green-50" />
        <StatCard label="To Pay (Suppliers)" value="RM 0.00" sub="PENDING" icon={ShoppingCart} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Low Stock Alert" value={`${stats.lowStockCount} Items`} sub="ACTION NEEDED" icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <button onClick={() => window.location.href='/sales'} className="bg-[#2563EB] text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition-all">
            <Plus size={18} strokeWidth={3} /> NEW SALE
         </button>
         <button onClick={() => window.location.href='/inventory'} className="bg-white text-slate-700 border border-slate-200 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <Package size={18} /> ADD INVENTORY
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50/10">
            <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest italic"><AlertTriangle size={14} /> Critical Low Stock</div>
            <button className="text-[10px] font-bold text-red-600 hover:underline uppercase">View All</button>
          </div>
          <table className="w-full text-left text-[12px]">
             <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
               <tr>
                 <th className="px-6 py-3">Item Code</th>
                 <th className="px-6 py-3">Name</th>
                 <th className="px-6 py-3 text-right">Stock</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                   <tr><td colSpan={3} className="py-12 text-center text-slate-400 italic">Inventory levels healthy.</td></tr>
                ) : lowStockItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-3 font-bold text-slate-800">{item.part_number}</td>
                     <td className="px-6 py-3 font-medium text-slate-600 uppercase">{item.name}</td>
                     <td className="px-6 py-3 text-right font-bold text-red-600">{item.stock_quantity}</td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Recent Sales</h4>
              <ChevronRight size={16} className="text-slate-400"/>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center p-10"><p className="text-[12px] text-slate-300 italic">No sales recorded yet.</p></div>
           <div className="p-4 border-t border-slate-50"><button onClick={() => window.location.href='/sales'} className="w-full py-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-all active:scale-95 uppercase">+ Create New Sale</button></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div className={clsx("p-2.5 rounded-xl shadow-inner", bg, color)}><Icon size={18} /></div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[12px] font-medium text-slate-500 mt-1 uppercase tracking-tighter">{label}</p>
    </div>
  );
}