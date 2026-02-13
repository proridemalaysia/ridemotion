"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Star, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CRMPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('total_spent', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  }

  const filtered = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Customer CRM</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lifetime Value & Loyalty Tracking</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none bg-white" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Customer Profile</th>
                <th className="px-5 py-3">Loyalty Pts</th>
                <th className="px-5 py-3">Lifetime Spent</th>
                <th className="px-5 py-3">Member Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner /></td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-[10px]">
                          {c.full_name?.charAt(0) || 'U'}
                       </div>
                       <div>
                          <div className="font-bold text-slate-800 uppercase tracking-tighter">{c.full_name || 'Guest User'}</div>
                          <div className="text-[10px] text-slate-400 font-medium lowercase italic">{c.id.slice(0,8)}...</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                       <Star size={12} className="text-amber-500" fill="currentColor" />
                       <span className="font-bold text-slate-700">{c.loyalty_points || 0}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-800 font-mono tracking-tighter">
                    RM {Number(c.total_spent || 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      c.total_spent > 1000 ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                      {c.total_spent > 1000 ? 'Platinum VIP' : 'General Member'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors p-1"><ArrowUpRight size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}