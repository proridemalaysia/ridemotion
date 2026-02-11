"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Star, CreditCard, MessageSquare, ArrowUpRight, Filter } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { clsx } from 'clsx';

export default function CRMPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('total_spent', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Customer CRM</h2>
          <p className="text-slate-400 text-sm font-medium">Analyze lifetime value and loyalty</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <Star className="text-amber-500" size={18} fill="currentColor" />
            <span className="text-[10px] font-black uppercase text-slate-400">Total Loyalty Issued:</span>
            <span className="text-sm font-black text-slate-800">{customers.reduce((acc, c) => acc + (c.loyalty_points || 0), 0)} pts</span>
          </div>
        </div>
      </div>

      {/* Top Spenders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {customers.slice(0, 4).map((c, idx) => (
          <div key={c.id} className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Users size={100} />
            </div>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               Top Spender #{idx + 1}
            </p>
            <h3 className="text-lg font-black truncate">{c.full_name || 'Guest'}</h3>
            <div className="mt-4 flex justify-between items-end">
               <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">LTV (Spent)</p>
                  <p className="text-xl font-black text-white italic">RM {c.total_spent?.toLocaleString()}</p>
               </div>
               <div className="bg-white/10 p-2 rounded-xl text-amber-400">
                  <Star size={20} fill="currentColor" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Customer Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name, phone or email..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 transition-colors">
            <Filter size={16} /> Advanced Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Customer Profile</th>
                <th className="px-6 py-5">Loyalty Points</th>
                <th className="px-6 py-5">Lifetime Value</th>
                <th className="px-6 py-5">Internal Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                          {c.full_name?.charAt(0) || 'U'}
                       </div>
                       <div>
                          <div className="font-bold text-slate-800 text-sm tracking-tight">{c.full_name || 'Guest User'}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{c.phone || 'No Phone'}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-slate-700">{c.loyalty_points || 0}</span>
                       <span className="text-[10px] font-black uppercase text-amber-500 italic">pts</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800 text-sm italic">RM {c.total_spent?.toFixed(2)}</div>
                    <div className="text-[10px] text-green-500 font-bold uppercase">Active Buyer</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      c.total_spent > 5000 ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {c.total_spent > 5000 ? 'VIP Platinum' : 'Standard Member'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><MessageSquare size={18} /></button>
                       <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><ArrowUpRight size={18} /></button>
                    </div>
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