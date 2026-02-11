"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Plus, Calendar, ArrowRight, CheckCircle, AlertCircle, History } from 'lucide-react';
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
    const { data } = await supabase.from('daily_closings').select('*').order('closing_date', { ascending: false });
    if (data) setClosings(data);
    setLoading(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Finance & Cashier</h2>
          <p className="text-slate-400 text-sm font-medium">Daily shift closing and cash reconciliation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
        >
          <Plus size={24} />
          PERFORM DAILY CLOSING
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex items-center gap-2">
           <History size={18} className="text-slate-400" />
           <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Shift History (Z-Reports)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Date</th>
                <th className="px-6 py-5">System Expected</th>
                <th className="px-6 py-5">Staff Declared</th>
                <th className="px-6 py-5">TNG/Card Total</th>
                <th className="px-6 py-5">Variance</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Spinner /></td></tr>
              ) : closings.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No closing records yet</td></tr>
              ) : closings.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                       <Calendar size={14} className="text-blue-500"/>
                       {new Date(c.closing_date).toLocaleDateString('en-MY')}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-600">RM {c.expected_cash.toFixed(2)}</td>
                  <td className="px-6 py-5 font-black text-slate-800">RM {c.actual_cash.toFixed(2)}</td>
                  <td className="px-6 py-5 text-xs text-slate-400 font-bold">
                    TNG: {c.total_tng.toFixed(2)} | Card: {c.total_card.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "font-black italic",
                      c.variance < 0 ? "text-red-600" : c.variance > 0 ? "text-blue-600" : "text-green-600"
                    )}>
                      {c.variance === 0 ? "Balanced" : `RM ${c.variance.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {c.variance === 0 ? (
                      <CheckCircle className="text-green-500 mx-auto" size={20} />
                    ) : (
                      <AlertCircle className="text-red-500 mx-auto" size={20} />
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