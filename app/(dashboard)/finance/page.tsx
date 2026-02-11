"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Plus, Calendar, CheckCircle, AlertCircle, History } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily Closings</h2>
          <p className="text-slate-500 text-sm">Review shift reconciliations and cash balance history</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Perform Closing
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
           <History size={16} className="text-gray-400" />
           <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Historical Z-Reports</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600 font-medium border-b border-gray-100 bg-gray-50/30">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">System Cash</th>
                <th className="px-6 py-4">Actual Cash</th>
                <th className="px-6 py-4">Variance</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : closings.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400">No shift records found</td></tr>
              ) : closings.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {new Date(c.closing_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono">RM {Number(c.expected_cash).toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold font-mono">RM {Number(c.actual_cash).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "font-semibold font-mono",
                      c.variance < 0 ? "text-red-600" : c.variance > 0 ? "text-blue-600" : "text-green-600"
                    )}>
                      {c.variance === 0 ? "Balanced" : `${c.variance > 0 ? '+' : ''}RM ${Number(c.variance).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.variance === 0 ? (
                      <CheckCircle className="text-green-500 mx-auto" size={18} />
                    ) : (
                      <AlertCircle className="text-red-500 mx-auto" size={18} />
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