"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { History, ShieldCheck, Clock, Search, Filter } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data } = await supabase
      .from('admin_logs')
      .select(`*, profiles(full_name)`)
      .order('created_at', { ascending: false });
    
    if (data) setLogs(data);
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Audit Trail</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">System Security Logs</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-blue-600 shadow-sm"><Filter size={18}/></button>
        </div>
      </div>

      <div className="bg-[#020617] text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="text-slate-500 uppercase font-bold border-b border-slate-800 bg-[#0F172A]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Action Taken</th>
                <th className="px-6 py-4">Entity affected</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner/></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-600 uppercase font-bold tracking-widest italic">System clean • No unauthorized actions logged</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400">
                    {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={14} className="text-emerald-500" />
                       <span className="font-bold uppercase tracking-tight">{log.profiles?.full_name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200 italic">{log.action}</td>
                  <td className="px-6 py-4 text-slate-400 font-bold uppercase tracking-widest text-[9px]">{log.entity}</td>
                  <td className="px-6 py-4 text-right text-slate-500 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}