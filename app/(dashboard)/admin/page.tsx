"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  DollarSign
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

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
      const { data: sales } = await supabase.from('sales').select('total_amount');
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

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <DollarSign size={20} />
            <span className="text-xs font-semibold uppercase text-gray-500">Total Revenue</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">RM {stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-orange-600 mb-4">
            <ShoppingCart size={20} />
            <span className="text-xs font-semibold uppercase text-gray-500">Orders Received</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.totalOrders}</h3>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertTriangle size={20} />
            <span className="text-xs font-semibold uppercase text-gray-500">Low Stock SKUs</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.lowStockCount}</h3>
        </div>

        {/* Assets */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <Package size={20} />
            <span className="text-xs font-semibold uppercase text-gray-500">Inventory Value</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">RM {stats.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Performance Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> System Summary
          </h4>
          <div className="space-y-3">
             <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Last Sync</span>
                <span className="font-medium text-slate-700">Just now</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Active Suppliers</span>
                <span className="font-medium text-slate-700">Online</span>
             </div>
          </div>
        </div>

        {/* Information box */}
        <div className="bg-blue-600 rounded-lg p-8 text-white">
          <h4 className="text-lg font-semibold mb-2">Operations Note</h4>
          <p className="text-blue-100 text-sm leading-relaxed">
            Welcome to the new PartsHub ERP. This dashboard provides real-time data from your warehouse and online store. Use the sidebar to manage your stock, process sales, or generate reports.
          </p>
        </div>
      </div>
    </div>
  );
}