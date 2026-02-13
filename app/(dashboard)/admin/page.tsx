"use client";
import React from 'react';
import { 
  TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Plus, Package, ChevronRight 
} from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardOverview() {
  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
          Overview for Fri Feb 13 2026
        </span>
      </div>

      {/* 1. TOP STATS CARDS (4-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Sales Revenue" 
          value="RM 0.00" 
          sub="TODAY" 
          icon={TrendingUp} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatCard 
          label="To Collect (Customers)" 
          value="RM 0.00" 
          sub="PENDING" 
          icon={DollarSign} 
          color="text-green-600" 
          bg="bg-green-50" 
        />
        <StatCard 
          label="To Pay (Suppliers)" 
          value="RM 0.00" 
          sub="PENDING" 
          icon={ShoppingCart} 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
        <StatCard 
          label="Low Stock Alert" 
          value="0 Items" 
          sub="ACTION NEEDED" 
          icon={AlertTriangle} 
          color="text-red-600" 
          bg="bg-red-50" 
        />
      </div>

      {/* 2. BIG ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <button className="bg-[#2563EB] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
            <Plus size={20} strokeWidth={3} /> 
            <span className="text-sm tracking-wide">New Sale</span>
         </button>
         <button className="bg-white text-slate-700 border border-slate-200 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Package size={20} /> 
            <span className="text-sm tracking-wide">Add Inventory</span>
         </button>
      </div>

      {/* 3. INFORMATION TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        
        {/* Left Section: Critical Low Stock */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50/10">
            <div className="flex items-center gap-2 text-red-600 font-bold text-[11px] uppercase tracking-[0.1em]">
              <AlertTriangle size={16} /> Critical Low Stock
            </div>
            <button className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-widest">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
               <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                 <tr>
                   <th className="px-6 py-4">Item Code</th>
                   <th className="px-6 py-4">Name</th>
                   <th className="px-6 py-4 text-right">Stock</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                     <td colSpan={3} className="py-16 text-center text-slate-400 font-medium italic">
                       All stock levels are healthy.
                     </td>
                  </tr>
               </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Recent Sales Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
           <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.1em]">Recent Sales</h4>
              <button className="text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-all">
                <ChevronRight size={18}/>
              </button>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center p-12">
              <p className="text-[13px] text-slate-300 font-medium italic">No sales recorded yet today.</p>
           </div>
           <div className="p-4 border-t border-slate-50">
              <button className="w-full py-2.5 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2">
                + Create New Sale
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

// Sub-component for individual stat cards
function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
      <div className="flex justify-between items-start mb-6">
        <div className={clsx("p-3 rounded-2xl shadow-inner transition-transform group-hover:scale-110", bg, color)}>
          <Icon size={22} />
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sub}</span>
      </div>
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[12px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">{label}</p>
    </div>
  );
}