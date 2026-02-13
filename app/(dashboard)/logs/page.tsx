"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, Search, Database, Clock 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { clsx } from 'clsx';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data } = await supabase
      .from('admin_logs')
      .select(`*, profiles(full_name)`)
      .order('created_at', { ascending: false });
    
    if (data) setLogs(data);
    setLoading(false);
  }

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return log.user_email?.toLowerCase().includes(searchLower) || 
           log.details?.toLowerCase().includes(searchLower) ||
           log.action?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Audit Trail</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">System Security & Activity Logs</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all shadow-sm"
        >
          <Clock size={18} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by staff email or action..." 
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#020617] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="text-slate-500 uppercase font-bold border-b border-slate-800 bg-[#0F172A]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner/></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-600 uppercase font-bold tracking-widest italic">Zero activities found</td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString('en-MY')}
                    <span className="ml-2 opacity-40">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-slate-200 font-bold uppercase">{log.profiles?.full_name || 'System'}</span>
                       <span className="text-[9px] text-slate-500">{log.user_email || 'internal-process'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                      log.action === 'DELETE' ? "bg-red-900/20 text-red-400 border-red-800/40" : 
                      log.action === 'UPDATE' ? "bg-amber-900/20 text-amber-400 border-amber-800/40" :
                      "bg-blue-900/20 text-blue-400 border-blue-800/40"
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px]">
                       <Database size={10} />
                       {log.entity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 font-medium italic truncate max-w-xs">
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-blue-900/10 p-4 rounded-xl border border-blue-900/20">
         <ShieldAlert className="text-blue-500" size={20}/>
         <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider leading-relaxed">
            Database Triggers are active. All modifications to parts and pricing are being recorded with snapshots.
         </p>
      </div>
    </div>
  );
}