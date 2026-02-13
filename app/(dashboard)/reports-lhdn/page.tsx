"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardCheck, Zap, ShieldCheck, FileSpreadsheet, 
  Search, CheckCircle2, AlertCircle, RefreshCw, Landmark 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

const TABS = ["e-Invoice Sync", "Consolidated B2C", "Buyer TIN Registry", "SST-02 Summary"];

export default function LHDNReportsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  async function fetchTabData() {
    setLoading(true);
    if (activeTab === "e-Invoice Sync") {
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      setData(sales || []);
    } else if (activeTab === "Buyer TIN Registry") {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .not('tin', 'is', null);
      setData(profiles || []);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">LHDN Compliance</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">MyInvois Integration Panel</p>
        </div>
        <button 
          onClick={fetchTabData}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 active:scale-90 transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[12px] font-bold uppercase tracking-widest transition-all relative active:scale-95 ${
              activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      {/* Content based on Active Tab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TAB 1: e-Invoice Sync */}
        {activeTab === "e-Invoice Sync" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">IRBM UUID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Spinner/></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">No pending e-Invoices found.</td></tr>
                ) : data.map(sale => (
                  <tr key={sale.id} className="hover:bg-blue-50/20 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-800">#ORD-{sale.order_number}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                         sale.einvoice_status === 'validated' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                       }`}>
                         {sale.einvoice_status}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{sale.einvoice_uuid || '---'}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-[10px] uppercase active:scale-95 transition-all">
                          Submit to IRBM
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Consolidated B2C */}
        {activeTab === "Consolidated B2C" && (
          <div className="p-12 text-center space-y-4">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <Zap size={32} />
             </div>
             <h3 className="font-bold text-slate-800 uppercase">Consolidation Engine</h3>
             <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                As per LHDN requirements, all B2C retail transactions not requiring individual e-Invoices can be consolidated monthly.
             </p>
             <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-100">
                Generate Consolidated XML
             </button>
          </div>
        )}

        {/* TAB 3: Buyer TIN Registry */}
        {activeTab === "Buyer TIN Registry" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">TIN Number</th>
                  <th className="px-6 py-4">BRN / NRIC</th>
                  <th className="px-6 py-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">No business tax profiles found.</td></tr>
                ) : data.map(profile => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase">{profile.full_name}</td>
                    <td className="px-6 py-4 font-mono text-blue-600 font-bold">{profile.tin}</td>
                    <td className="px-6 py-4 text-slate-500">{profile.brn}</td>
                    <td className="px-6 py-4 text-right text-green-500 font-bold uppercase tracking-widest">Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: SST-02 Summary */}
        {activeTab === "SST-02 Summary" && (
          <div className="p-8 space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Taxable Sales (10%)</p>
                   <h4 className="text-2xl font-bold text-slate-800 italic">RM 0.00</h4>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total SST Payable</p>
                   <h4 className="text-2xl font-bold text-red-600 italic">RM 0.00</h4>
                </div>
             </div>
             <button className="w-full flex items-center justify-center gap-2 border-2 border-slate-900 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all">
                <FileSpreadsheet size={16}/> Export SST-02 Data (Excel)
             </button>
          </div>
        )}

      </div>

      <div className="bg-[#020617] p-6 rounded-2xl text-white flex items-center justify-between shadow-xl">
         <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl"><Landmark size={24}/></div>
            <div>
               <h4 className="font-bold uppercase text-xs tracking-widest text-blue-400 italic">LHDN Sandbox Connection</h4>
               <p className="text-[10px] text-slate-400 font-medium">Auto-sync is currently in development mode. API calls are simulated.</p>
            </div>
         </div>
         <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">
            Configure API Keys
         </button>
      </div>
    </div>
  );
}