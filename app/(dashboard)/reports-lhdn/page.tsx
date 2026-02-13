"use client";
import React from 'react';
import { ClipboardCheck, Zap, Info, ShieldCheck } from 'lucide-react';

export default function LHDNReportsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">LHDN Compliance Reports</h2>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">MyInvois Integration Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
           <div className="flex items-center gap-3 mb-4 text-blue-600">
             <Zap size={20} />
             <h3 className="font-bold uppercase text-xs">e-Invoice Status Summary</h3>
           </div>
           <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
             "Automated submission of validated e-Invoices to IRBM portal is pending API key configuration in Utilities."
           </p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
           <div className="flex items-center gap-3 mb-4 text-green-600">
             <ShieldCheck size={20} />
             <h3 className="font-bold uppercase text-xs">Tax Integrity Report</h3>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 border-b pb-1"><span>Consolidated B2C Sum</span><span>RM 0.00</span></div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400"><span>Quarterly SST Collected</span><span>RM 0.00</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}