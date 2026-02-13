"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Plus, Calendar, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import ZReportModal from '@/components/ZReportModal';
import { clsx } from 'clsx';

export default function FinancePage() {
  const [closings, setClosings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchClosings();
  }, []);

  async function fetchClosings() {
    setLoading(true);
    const { data } = await supabase
      .from('daily_closings')
      .select('*')
      .order('closing_date', { ascending: false });
    if (data) setClosings(data);
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Shift Closings</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Daily Z-Report & Cash Reconciliation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563EB] text-white px-4 py-2 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm uppercase tracking-wide"
        >
          <Calculator size={16} strokeWidth={3} /> Perform Daily Closing
        </button>
      </div>

      {/* Finance Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Closing Date</th>
                <th className="px-5 py-3 text-right">System (Expected)</th>
                <th className="px-5 py-3 text-right">Staff (Declared)</th>
                <th className="px-5 py-3 text-right">Variance</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : closings.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-medium italic uppercase tracking-widest">No shift reports found.</td></tr>
              ) : closings.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3 text-slate-600 font-semibold uppercase tracking-tighter">
                    <Calendar size={12} className="inline mr-2 text-blue-400 mb-0.5" />
                    {new Date(c.closing_date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-400 italic">RM {Number(c.expected_cash).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800 font-mono tracking-tight">RM {Number(c.actual_cash).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-bold italic">
                    <span className={clsx(
                      Number(c.variance) < 0 ? "text-red-600" : Number(c.variance) > 0 ? "text-blue-600" : "text-green-600"
                    )}>
                      {Number(c.variance) === 0 ? "BALANCED" : `RM ${Number(c.variance).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {Number(c.variance) === 0 ? (
                      <CheckCircle className="text-green-500 mx-auto" size={18} strokeWidth={2.5} />
                    ) : (
                      <AlertCircle className="text-red-500 mx-auto" size={18} strokeWidth={2.5} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ZReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchClosings} />
    </div>
  );
}