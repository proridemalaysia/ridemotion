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

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Fetch Profile Data (Full Name, Points, etc.)
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // 2. Fetch Order History for this specific user
        const { data: ord } = await supabase
          .from('sales')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        setProfile(prof);
        setOrders(ord || []);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Spinner size={40} className="text-orange-500" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Accessing Member Data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-4">
      
      {/* 1. Member Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-50 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="w-24 h-24 bg-[#020617] rounded-3xl flex items-center justify-center text-white shadow-xl relative z-10">
           <User size={48} strokeWidth={1.5} />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase italic">
            {profile?.full_name || 'Valued Member'}
           </h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Registered Member • Since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
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
                    <p className="text-[10px] font-bold uppercase leading-none opacity-70">Purchase History</p>
                    <p className="text-xl font-bold tracking-tighter">{orders.length} Total Orders</p>
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
         {/* 2. Order History Table */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
               <Clock size={14} /> Recent Transactions
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Order Ref</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Details</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {orders.map(order => (
                        <React.Fragment key={order.id}>
                           <tr className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 font-bold text-slate-900 uppercase">#ORD-{order.order_number}</td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString('en-MY')}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900 italic">RM {Number(order.total_amount).toFixed(2)}</td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                                    order.status === 'completed' 
                                    ? 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-50' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-50'
                                 }`}>
                                    {order.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                    <ChevronRight size={20} />
                                 </button>
                              </td>
                           </tr>
                           {/* Tracking Integration */}
                           {order.tracking_number && (
                             <tr className="bg-blue-50/40 border-b border-slate-100">
                               <td colSpan={5} className="px-6 py-3">
                                  <div className="flex items-center justify-between text-[11px]">
                                     <div className="flex items-center gap-3 font-bold text-blue-700 uppercase tracking-tighter">
                                        <Truck size={14} className="animate-bounce" />
                                        <span>Shipped via {order.courier_name} • <span className="underline decoration-2">{order.tracking_number}</span></span>
                                     </div>
                                     <button className="flex items-center gap-1 font-bold text-blue-600 hover:underline uppercase tracking-widest">
                                        Track Parcel <ExternalLink size={12} />
                                     </button>
                                  </div>
                               </td>
                             </tr>
                           )}
                        </React.Fragment>
                     ))}
                  </tbody>
               </table>
               {orders.length === 0 && (
                  <div className="py-24 text-center">
                     <Package size={48} className="mx-auto text-slate-100 mb-4" />
                     <p className="text-slate-400 font-bold uppercase text-xs italic">No purchase history found on this account.</p>
                  </div>
               )}
            </div>
         </div>

         {/* 3. Member Info Sidebar */}
         <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Account Info</h3>
            
            <div className="bg-[#020617] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
               <MapPin className="absolute -right-6 -bottom-6 opacity-10 w-32 h-32" />
               <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><MapPin size={18} /></div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Default Shipping</span>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                  {profile?.address || "No address saved. Add one to your next order for faster checkout."}
               </p>
               <button className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95">
                  Manage Addresses
               </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
               <div className="flex items-center gap-3 mb-4 text-orange-600">
                  <ShieldCheck size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Loyalty Status</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {profile?.loyalty_points > 500 
                    ? "You are a Gold Tier member! Enjoy 5% off selected parts." 
                    : "Earn points on every RM1 spent. Redemptions start at 100 points."}
               </p>
               <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-1000" 
                    style={{ width: `${Math.min((profile?.loyalty_points / 500) * 100, 100)}%` }}
                  ></div>
               </div>
               <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest">
                  {500 - (profile?.loyalty_points || 0)} pts until next tier reward
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}