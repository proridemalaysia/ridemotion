"use client";
import React from 'react';
import { 
  TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Plus, Package, ChevronRight 
} from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardOverview() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Overview for Wed Feb 11 2026</span>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Sales Revenue" value="RM 0.00" sub="TODAY" icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="To Collect (Customers)" value="RM 0.00" sub="PENDING" icon={DollarSign} color="text-green-600" bg="bg-green-50" />
        <StatCard label="To Pay (Suppliers)" value="RM 0.00" sub="PENDING" icon={ShoppingCart} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Low Stock Alert" value="0 Items" sub="ACTION NEEDED" icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
         <button className="md:col-span-4 bg-[#2563EB] text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm">
            <Plus size={20} strokeWidth={3} /> New Sale
         </button>
         <button className="md:col-span-4 bg-white text-slate-700 border border-slate-200 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Package size={20} /> Add Inventory
         </button>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Critical Low Stock (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
              <AlertTriangle size={16} /> CRITICAL LOW STOCK
            </div>
            <button className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-widest">View All</button>
          </div>
          <div className="p-0">
             <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-400 uppercase">Item Code</th>
                    <th className="px-6 py-3 font-semibold text-slate-400 uppercase">Name</th>
                    <th className="px-6 py-3 font-semibold text-slate-400 uppercase text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      All stock levels are healthy.
                    </td>
                  </tr>
                </tbody>
             </table>
          </div>
        </div>

        {/* Recent Sales (1/3 width) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Recent Sales</h4>
            <button className="text-blue-600"><ChevronRight size={18}/></button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-10">
             <p className="text-[13px] text-slate-400 italic">No sales yet.</p>
          </div>
          <div className="p-4 border-t border-slate-50">
             <button className="w-full py-2 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                + Create New Sale
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className={clsx("p-3 rounded-full shadow-inner", bg, color)}>
          <Icon size={20} />
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{sub}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[12px] font-medium text-slate-400 mt-1">{label}</p>
    </div>
  );
}