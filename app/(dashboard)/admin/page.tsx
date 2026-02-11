"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Plus, Package, ArrowRight 
} from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ revenue: 0, lowStock: 0 });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: sales } = await supabase.from('sales').select('total_amount');
      const { data: variants } = await supabase.from('product_variants').select('*, products(name)').lte('stock_quantity', 5);
      
      if (sales) setStats(prev => ({ ...prev, revenue: sales.reduce((acc, s) => acc + Number(s.total_amount), 0) }));
      if (variants) {
        setStats(prev => ({ ...prev, lowStock: variants.length }));
        setLowStockItems(variants);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <span className="text-[11px] text-slate-400 font-medium">Overview for {new Date().toDateString()}</span>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Sales Revenue', value: `RM ${stats.revenue.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Today' },
          { label: 'To Collect (Customers)', value: 'RM 0.00', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', sub: 'Pending' },
          { label: 'To Pay (Suppliers)', value: 'RM 0.00', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Pending' },
          { label: 'Low Stock Alert', value: `${stats.lowStock} Items`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', sub: 'Action Needed' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-2 rounded-lg", card.bg, card.color)}><card.icon size={18} /></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{card.sub}</span>
             </div>
             <h3 className="text-xl font-bold text-slate-900">{card.value}</h3>
             <p className="text-[11px] text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Big Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <button className="bg-blue-600 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md">
            <Plus size={20} /> New Sale
         </button>
         <button className="bg-white text-slate-700 border border-gray-200 p-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Package size={20} /> Add Inventory
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Low Stock Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
            <h4 className="text-xs font-bold text-red-700 flex items-center gap-2 italic uppercase">
              <AlertTriangle size={14} /> Critical Low Stock
            </h4>
            <button className="text-[10px] font-bold text-red-600 hover:underline">View All</button>
          </div>
          <table className="w-full text-left text-[12px]">
            <thead className="bg-gray-50 text-slate-500 font-semibold border-b border-gray-100">
               <tr>
                  <th className="px-4 py-2 font-medium">Item Code</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium text-right">Stock</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {lowStockItems.length === 0 ? (
                 <tr><td colSpan={3} className="py-10 text-center text-slate-400">All stock levels are healthy.</td></tr>
               ) : lowStockItems.map(item => (
                 <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-semibold text-slate-700 uppercase">{item.sku}</td>
                    <td className="px-4 py-2 text-slate-600">{item.products?.name}</td>
                    <td className="px-4 py-2 text-right text-red-600 font-bold">{item.stock_quantity}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>

        {/* Recent Sales Widget */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
           <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Recent Sales</h4>
              <ArrowRight size={14} className="text-blue-500" />
           </div>
           <div className="flex-1 flex flex-col items-center justify-center p-6">
              <p className="text-[12px] text-slate-400 italic">No sales yet today.</p>
           </div>
           <div className="p-4 border-t border-gray-100">
              <button className="w-full text-[11px] font-bold text-blue-600 hover:bg-blue-50 py-2 rounded transition-all">
                + Create New Sale
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

const clsx = (...classes: any) => classes.filter(Boolean).join(' ');