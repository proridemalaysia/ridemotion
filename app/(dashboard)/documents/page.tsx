"use client";
import React, { useState } from 'react';
import { FileText, Search, Download, ExternalLink, Filter } from 'lucide-react';

const TABS = ["Sales Invoices", "Purchase Orders", "Delivery Orders", "Credit Notes"];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Document Hub</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Centralized Archive</p>
        </div>
      </div>

      <div className="flex items-center gap-8 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[12px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex justify-between">
           <div className="relative w-80">
             <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Search filename or ref..." className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-xs" />
           </div>
           <button className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase border border-slate-200 px-3 py-1 rounded bg-white">
              <Filter size={12}/> Filter by Date
           </button>
        </div>
        <table className="w-full text-left text-[12px]">
           <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
             <tr>
               <th className="px-6 py-4">Ref Number</th>
               <th className="px-6 py-4">Date Generated</th>
               <th className="px-6 py-4">Type</th>
               <th className="px-6 py-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody>
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                   No documents found in {activeTab}.
                </td>
              </tr>
           </tbody>
        </table>
      </div>
    </div>
  );
}