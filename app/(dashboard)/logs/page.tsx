"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { History, ShieldCheck, Clock } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('admin_logs').select(`*, profiles(full_name)`).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Audit Trail</h2>
      <div className="bg-[#020617] text-white p-6 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="text-slate-500 uppercase font-bold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
               <tr><td colSpan={4} className="py-10 text-center"><Spinner/></td></tr>
            ) : logs.length === 0 ? (
               <tr><td colSpan={4} className="py-20 text-center text-slate-600 uppercase font-bold tracking-widest italic">System clean • No logs recorded</td></tr>
            ) : logs.map(log => (
               <tr key={log.id}>
                  <td className="px-4 py-3 font-mono text-blue-400">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold uppercase">{log.profiles?.full_name}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-slate-400">{log.entity}</td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}