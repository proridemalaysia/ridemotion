"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  History, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  User, 
  Database, // Fixed: Capitalized D
  Clock, 
  Info 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { clsx } from 'clsx';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("All Modules");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`*, profiles(full_name)`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching logs:", error);
    }
    
    if (data) setLogs(data);
    setLoading(false);
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "All Modules" || log.entity === filterModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Security Audit Trail</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time Activity Monitoring</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={fetchLogs}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 active:scale-90 transition-all shadow-sm"
           >
             <Clock size={18} />
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by User Email or Details..." 
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Filter Module:</span>
           <select 
            className="p-1.5 border border-slate-200 rounded-md text-xs font-bold bg-slate-50 outline-none"
            onChange={(e) => setFilterModule(e.target.value)}
           >
              <option value="All Modules">All Modules</option>
              <option value="products_flat">Inventory</option>
              <option value="sales">Sales</option>
              <option value="profiles">Users</option>
           </select>
        </div>
      </div>

      {/* Logs Table (Slate-950 Theme Matching Sidebar) */}
      <div className="bg-[#020617] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="text-slate-500 uppercase font-bold border-b border-slate-800 bg-[#0F172A]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor (Staff)</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner/></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-600 uppercase font-bold tracking-widest italic">No activities found matching filters</td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-blue-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString('en-MY')}
                    <span className="ml-2 opacity-50">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-slate-200 font-bold uppercase tracking-tight">{log.profiles?.full_name || 'System'}</span>
                       <span className="text-[9px] text-slate-500 lowercase">{log.user_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                      log.action === 'DELETE' ? "bg-red-900/40 text-red-400 border border-red-800/50" : 
                      log.action === 'UPDATE' ? "bg-amber-900/40 text-amber-400 border border-amber-800/50" :
                      "bg-blue-900/40 text-blue-400 border border-blue-800/50"
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                       <Database size={10} className="text-slate-600" />
                       {log.entity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 font-medium leading-relaxed max-w-sm line-clamp-2 italic">
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Info Footer */}
      <div className="flex items-center gap-3 bg-blue-900/10 p-4 rounded-xl border border-blue-900/20">
         <ShieldAlert className="text-blue-500" size={20}/>
         <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider leading-relaxed">
            Data integrity monitoring: Automated triggers are capturing all DML operations. Logs are immutable and retained for security auditing.
         </p>
      </div>
    </div>
  );
}