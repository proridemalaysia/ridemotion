"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, LogOut 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState("Connecting...");

  useEffect(() => {
    async function getMemberData() {
      setLoading(true);
      
      // 1. Get Session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSystemStatus("No User Session Found");
        window.location.href = '/login';
        return;
      }

      // 2. Fetch Profile (matches your Supabase screenshot columns)
      const { data: prof, error: pError } = await supabase
        .from('profiles')
        .select('full_name, loyalty_points, created_at, role')
        .eq('id', user.id)
        .single();

      if (pError) {
        console.error(pError);
        setSystemStatus("Error: " + pError.message);
      } else {
        setProfile(prof);
        setSystemStatus("Database Linked: " + prof.full_name);
      }

      // 3. Fetch Orders
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-[#F8FAFC]">
      <Spinner size={40} className="text-blue-600" />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waking Database...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 mt-4 font-sans">
      
      {/* 0. System Diagnostic Bar (Remove this later) */}
      <div className="bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full w-fit mx-auto shadow-lg">
         Status: {systemStatus}
      </div>

      {/* 1. Profile Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="w-20 h-20 bg-[#020617] rounded-2xl flex items-center justify-center text-white shadow-xl">
           <User size={40} />
        </div>

        <div className="flex-1 text-center md:text-left">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {profile?.full_name || 'Syncing Name...'}
           </h1>
           <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Registered: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-MY') : '...'}
           </p>
           
           <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-3">
                 <Star size={16} fill="currentColor" />
                 <div>
                    <p className="text-[9px] font-bold uppercase leading-none opacity-60">Loyalty Pts</p>
                    <p className="text-lg font-bold tracking-tighter">{profile?.loyalty_points || 0}</p>
                 </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-3">
                 <Package size={16} />
                 <div>
                    <p className="text-[9px] font-bold uppercase leading-none opacity-60">Total Orders</p>
                    <p className="text-lg font-bold tracking-tighter">{orders.length}</p>
                 </div>
              </div>
           </div>
        </div>

        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
          className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded transition-all border border-red-50"
        >
          Logout Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 2. Order History */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Shipment History</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Ref Number</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-800">#ORD-{order.order_number}</td>
                           <td className="px-6 py-4 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-900">RM {Number(order.total_amount).toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                 {order.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {orders.length === 0 && (
                  <div className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                    No transactions found
                  </div>
               )}
            </div>
         </div>

         {/* 3. Sidebar */}
         <div className="space-y-6">
            <div className="bg-[#020617] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <MapPin size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Shipping Destination</span>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {profile?.address || "No primary address set in profile."}
               </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
               <div className="flex items-center gap-3 mb-4 text-orange-600">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Member Status</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Enjoy automated sync between your workshop and our warehouse. Earn loyalty points on every ringgit spent.
               </p>
            </div>
         </div>
      </div>

      <div className="text-center pt-10">
         <p className="text-[9px] font-bold text-slate-200 uppercase tracking-[1em]">Secure Vault Connection v2.0</p>
      </div>
    </div>
  );
}