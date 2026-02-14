"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, LogOut 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { clsx } from 'clsx'; // THIS WAS MISSING - ADDED NOW

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState("Connecting...");

  useEffect(() => {
    async function getMemberData() {
      setLoading(true);
      
      // 1. Get current login session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSystemStatus("No User Session Found");
        window.location.href = '/login';
        return;
      }

      // 2. Fetch Profile from 'profiles' table
      const { data: prof, error: pError } = await supabase
        .from('profiles')
        .select('full_name, loyalty_points, created_at, role, address')
        .eq('id', user.id)
        .single();

      if (pError) {
        console.error("Profile Error:", pError);
        setSystemStatus("Error: " + pError.message);
      } else {
        setProfile(prof);
        setSystemStatus("Account Linked: " + prof.full_name);
      }

      // 3. Fetch Real Orders from 'sales' table
      const { data: ord } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ord) setOrders(ord);
      setLoading(false);
    }

    getMemberData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-[#F8FAFC]">
      <Spinner size={40} className="text-orange-500" />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Session...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 mt-6 font-sans">
      
      {/* 0. Small Diagnostic Badge */}
      <div className="flex justify-center">
        <div className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
           System: {systemStatus}
        </div>
      </div>

      {/* 1. Profile Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="w-24 h-24 bg-[#020617] rounded-3xl flex items-center justify-center text-white shadow-2xl relative z-10">
           <User size={48} strokeWidth={1.5} />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight italic uppercase">
            {profile?.full_name || 'Member Account'}
           </h1>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
            Registered: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-MY') : '...'}
           </p>
           
           <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Star size={18} fill="currentColor" />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-60">Loyalty Pts</p>
                    <p className="text-lg font-bold tracking-tighter">{profile?.loyalty_points || 0}</p>
                 </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 text-blue-700 px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Package size={18} />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-60">Total Orders</p>
                    <p className="text-lg font-bold tracking-tighter">{orders.length}</p>
                 </div>
              </div>
           </div>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 px-6 py-3 rounded-xl transition-all border border-red-100 active:scale-95 shadow-sm"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* 2. Order History Table */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
               <Clock size={14} /> My Recent Orders
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <tr>
                          <th className="px-6 py-4">Ref Number</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Details</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {orders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                             <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">#ORD-{order.order_number}</td>
                             <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono">RM {Number(order.total_amount).toFixed(2)}</td>
                             <td className="px-6 py-4 text-center">
                                <span className={clsx(
                                  "text-[10px] font-bold uppercase px-3 py-1 rounded-full border",
                                  order.status === 'completed' ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                )}>
                                   {order.status}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                               <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all active:scale-90">
                                 <ChevronRight size={18} />
                               </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
               {orders.length === 0 && (
                  <div className="py-24 text-center">
                     <Package size={48} className="mx-auto text-slate-100 mb-4" />
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No purchase history found</p>
                  </div>
               )}
            </div>
         </div>

         {/* 3. Account Sidebar Area */}
         <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Warehouse Sync</h3>
            
            <div className="bg-[#020617] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden text-nowrap">
               <MapPin className="absolute -right-6 -bottom-6 opacity-10 w-32 h-32" />
               <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><MapPin size={18} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Primary Address</span>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium italic whitespace-normal">
                  {profile?.address || "No primary address recorded. Please add one to your next order for faster checkout."}
               </p>
               <button className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95">
                  Update Profile
               </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
               <div className="flex items-center gap-3 mb-4 text-orange-600">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">System Integrated</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Your account is fully synced with the PartsHub ERP. Enjoy automated order tracking and priority technical support.
               </p>
            </div>
         </div>
      </div>

      <div className="text-center pt-12 border-t border-slate-100">
         <p className="text-[9px] font-bold text-slate-200 uppercase tracking-[1.5em]">Verified Secure Portal v2.0.1</p>
      </div>
    </div>
  );
}