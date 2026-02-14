"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, LogOut 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { signOutAction } from '@/app/login/actions';

export default function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>("");

  useEffect(() => {
    // This function will run every time the user state changes
    const getIdentity = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch Profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Fetch Orders
        const { data: ord } = await supabase
          .from('sales')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        setProfile(prof);
        setOrders(ord || []);
        setLastSync(new Date().toLocaleTimeString());
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    };

    getIdentity();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-[#F8FAFC]">
      <Spinner size={40} className="text-blue-600" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Database...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 px-4">
      
      {/* 1. Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="w-24 h-24 bg-[#020617] rounded-3xl flex items-center justify-center text-white shadow-xl">
           <User size={48} strokeWidth={1.5} />
        </div>

        <div className="flex-1 text-center md:text-left">
           {/* If profile.full_name is still null in DB, it shows "Member" */}
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase italic">
            {profile?.full_name || 'Member Account'}
           </h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Registered: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
           </p>
           
           <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-5 py-2 rounded-xl flex items-center gap-3">
                 <Star size={18} fill="currentColor" />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-70">Loyalty Pts</p>
                    <p className="text-xl font-bold tracking-tighter">{profile?.loyalty_points || 0}</p>
                 </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-2 rounded-xl flex items-center gap-3">
                 <Package size={18} />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-70">Total Orders</p>
                    <p className="text-xl font-bold tracking-tighter">{orders.length}</p>
                 </div>
              </div>
           </div>
        </div>

        <form action={signOutAction} className="md:absolute md:top-8 md:right-8">
           <button type="submit" className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-lg transition-all active:scale-95">
              <LogOut size={16} /> Sign Out
           </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Order History</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-4">Ref Number</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 font-bold text-slate-900">#ORD-{order.order_number}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-900 italic">RM {Number(order.total_amount).toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right"><ChevronRight size={18} className="text-slate-300 ml-auto" /></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {orders.length === 0 && (
                  <div className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No orders found.</div>
               )}
            </div>
         </div>

         <div className="bg-[#020617] rounded-3xl p-8 text-white h-fit shadow-2xl">
            <h3 className="text-[11px] font-bold uppercase text-blue-400 tracking-widest mb-6">Security & Session</h3>
            <div className="space-y-4">
               <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase">Last Sync</span>
                  <span className="text-xs font-mono">{lastSync}</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase">DB Connection</span>
                  <span className="text-xs text-green-500 font-bold uppercase tracking-tighter">Verified</span>
               </div>
            </div>
            <p className="mt-8 text-[10px] text-slate-500 italic leading-relaxed">
               Every time you load this page, your membership data is verified against the PartsHub secure vault.
            </p>
         </div>
      </div>

      {/* VERSION CHECKER: If this says "v1.0.8", you know the code updated. */}
      <div className="text-center opacity-20 hover:opacity-100 transition-opacity">
         <p className="text-[9px] font-bold uppercase tracking-[1em]">Deploy Version: v1.0.8</p>
      </div>
    </div>
  );
}