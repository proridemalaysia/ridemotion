"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockCount: 0,
    inventoryValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // 1. Fetch Sales Stats
      const { data: sales } = await supabase.from('sales').select('total_amount');
      
      // 2. Fetch Inventory Stats
      const { data: variants } = await supabase.from('product_variants').select('stock_quantity, cost_price, low_stock_alert');

      if (sales && variants) {
        const totalRev = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
        const invVal = variants.reduce((acc, v) => acc + (Number(v.cost_price) * v.stock_quantity), 0);
        const lowStock = variants.filter(v => v.stock_quantity <= v.low_stock_alert).length;

        setStats({
          totalSales: totalRev,
          totalOrders: sales.length,
          lowStockCount: lowStock,
          inventoryValue: invVal
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cardClass = "bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Operations Overview</h2>
        <p className="text-slate-400 text-sm font-medium">Real-time health of your hybrid business</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={cardClass}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><DollarSign size={24}/></div>
            <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={12}/> 12.5%
            </span>
          </div>
          <p className="mt-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-2xl font-black text-slate-800">RM {stats.totalSales.toLocaleString()}</h3>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><ShoppingCart size={24}/></div>
            <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={12}/> 8%
            </span>
          </div>
          <p className="mt-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Orders Fulfilled</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.totalOrders}</h3>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><AlertTriangle size={24}/></div>
            <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
               Action Required
            </span>
          </div>
          <p className="mt-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Low Stock SKUs</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.lowStockCount}</h3>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Package size={24}/></div>
          </div>
          <p className="mt-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Stock Asset Value</p>
          <h3 className="text-2xl font-black text-slate-800">RM {stats.inventoryValue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Profit Analysis Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" /> Recent Profit Margins
            </h4>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Item SKU</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Sell (POS)</th>
                <th className="px-6 py-4">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 underline decoration-blue-200">EXAMPLE-SKU-01</td>
                  <td className="px-6 py-4 text-gray-500">RM 45.00</td>
                  <td className="px-6 py-4 font-black text-slate-800">RM 89.00</td>
                  <td className="px-6 py-4"><span className="text-green-600 font-black">49.4%</span></td>
               </tr>
            </tbody>
          </table>
        </div>

        {/* CBM / Logistics Preview */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <Package className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          <h4 className="font-black uppercase text-xs tracking-widest text-blue-400 mb-6">Logistics Insight</h4>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Total Shipping Volume</p>
              <h3 className="text-4xl font-black italic tracking-tighter">1.42 <span className="text-lg text-blue-300 font-medium">m³ (CBM)</span></h3>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
               <p className="text-xs font-medium text-gray-300 leading-relaxed">
                 You have <span className="text-white font-black">4 items</span> that currently exceed standard courier weight limits. Check the CBM report for container planning.
               </p>
            </div>
            <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">Open CBM Analyzer →</button>
          </div>
        </div>
      </div>
    </div>
  );
}