"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Plus, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import ZReportModal from '@/components/ZReportModal';

export default function FinancePage() {
  const [closings, setClosings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchClosings();
  }, []);

  async function fetchClosings() {
    setLoading(true);
    const { data } = await supabase.from('daily_closings').select('*').order('closing_date', { ascending: false });
    if (data) setClosings(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Daily Financial Closings</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-[12px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus size={14} /> Perform Shift Closing
        </button>
      </div>

      {/* Finance History Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Closing Date</th>
                <th className="px-4 py-3 text-right">System Expected</th>
                <th className="px-4 py-3 text-right">Staff Declared</th>
                <th className="px-4 py-3 text-right">Variance</th>
                <th className="px-4 py-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : closings.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">No shift records available.</td></tr>
              ) : closings.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-600 font-medium">{new Date(c.closing_date).toLocaleDateString('en-MY')}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">RM {Number(c.expected_cash).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-800">RM {Number(c.actual_cash).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-bold italic ${Number(c.variance) < 0 ? 'text-red-600' : Number(c.variance) > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                      {Number(c.variance) === 0 ? "BALANCED" : `RM ${Number(c.variance).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {Number(c.variance) === 0 ? (
                      <CheckCircle className="text-green-500 mx-auto" size={16} />
                    ) : (
                      <AlertCircle className="text-red-500 mx-auto" size={16} />
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