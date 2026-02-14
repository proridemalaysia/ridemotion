"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, LogOut, AlertCircle 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { signOutAction } from '@/app/login/actions';

export default function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    setLoading(true);
    try {
      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setDebugInfo("No active session found. Redirecting...");
        window.location.href = '/login';
        return;
      }

      setDebugInfo(`User found: ${user.email}. Fetching profile...`);

      // 2. Fetch Profile from 'profiles' table
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to prevent crash if row missing
      
      if (profError) {
        console.error("Database Error:", profError);
        setDebugInfo("Database error: " + profError.message);
      }

      if (!prof) {
        setDebugInfo("Profile row missing in database for this user.");
      } else {
        setDebugInfo("Profile loaded successfully.");
        setProfile(prof);
      }

      // 3. Fetch Orders
      const { data: ord } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ord) setOrders(ord);

    } catch (err: any) {
      setDebugInfo("System Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Spinner size={40} className="text-orange-500" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Secure Data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-4">
      
      {/* DEBUG BAR - Remove this after it works */}
      {!profile && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[10px] font-mono text-amber-700">
           DEBUG: {debugInfo}
        </div>
      )}

      {/* 1. Member Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="w-24 h-24 bg-[#020617] rounded-3xl flex items-center justify-center text-white shadow-xl relative z-10">
           <User size={48} strokeWidth={1.5} />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           {/* FALLBACK LOGIC: If full_name is null, show "Member" */}
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase italic">
            {profile?.full_name || 'PartsHub Member'}
           </h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Registered Account • Since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
           </p>
           
           <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Star size={18} fill="currentColor" />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-70">Loyalty Balance</p>
                    <p className="text-xl font-bold tracking-tighter">{profile?.loyalty_points || 0} Pts</p>
                 </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Package size={18} />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-70">Orders</p>
                    <p className="text-xl font-bold tracking-tighter">{orders.length} History</p>
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
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Purchase History</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">View</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-900 uppercase">#ORD-{order.order_number}</td>
                           <td className="px-6 py-4 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono">RM {Number(order.total_amount || 0).toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${order.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right"><ChevronRight size={18} className="text-slate-300 ml-auto" /></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {orders.length === 0 && (
                  <div className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No transactions recorded</div>
               )}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-[#020617] rounded-3xl p-8 text-white shadow-2xl">
               <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <MapPin size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping Address</span>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed italic">
                  {profile?.address || "No primary address set."}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}