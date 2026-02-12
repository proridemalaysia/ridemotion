"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: ord } = await supabase.from('sales').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
      setProfile(prof);
      setOrders(ord || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-40"><Spinner size={32} className="text-orange-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Header & Identity Section */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-20 h-20 bg-slate-900 rounded flex items-center justify-center text-white shadow-md">
           <User size={40} strokeWidth={1.5} />
        </div>

        <div className="flex-1 text-center md:text-left">
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {profile?.full_name || 'Valued Member'}
           </h1>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
            Registered Account • Since {new Date(profile?.created_at).getFullYear() || '2024'}
           </p>
           
           <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-1.5 rounded flex items-center gap-2">
                 <Star size={14} fill="currentColor" />
                 <span className="text-[11px] font-bold uppercase">Loyalty: {profile?.loyalty_points || 0} Pts</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded flex items-center gap-2">
                 <Package size={14} />
                 <span className="text-[11px] font-bold uppercase">{orders.length} Total Orders</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 2. Main Order History Table (High-Density) */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> Order History
               </h3>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden text-sm">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Order Ref</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {orders.map(order => (
                        <React.Fragment key={order.id}>
                           <tr className="hover:bg-gray-50 transition-colors group">
                              <td className="px-4 py-3 font-semibold text-slate-700">#ORD-{order.order_number}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString('en-MY')}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">RM {order.total_amount.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                    order.status === 'completed' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                 }`}>
                                    {order.status}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                 <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                    <ChevronRight size={18} />
                                 </button>
                              </td>
                           </tr>
                           {/* Integrated Tracking Info if available */}
                           {order.tracking_number && (
                             <tr className="bg-blue-50/30">
                               <td colSpan={5} className="px-4 py-2 border-b border-gray-100">
                                  <div className="flex items-center justify-between text-[11px]">
                                     <div className="flex items-center gap-2 font-medium text-blue-700">
                                        <Truck size={14} />
                                        <span>Shipped via {order.courier_name || 'Courier'} • <b>{order.tracking_number}</b></span>
                                     </div>
                                     <button className="flex items-center gap-1 font-bold text-blue-600 hover:underline">
                                        Track <ExternalLink size={10} />
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
                  <div className="py-20 text-center text-slate-400 italic">No purchase history found.</div>
               )}
            </div>
         </div>

         {/* 3. Account Sidebar Area */}
         <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Account Info</h3>
            
            <div className="bg-slate-900 rounded p-6 text-white shadow-md">
               <div className="flex items-center gap-2 mb-4 text-blue-400">
                  <MapPin size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Default Shipping</span>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {profile?.address || "No address saved yet. Please update your profile for faster checkout."}
               </p>
               <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded text-[11px] font-bold uppercase tracking-widest transition-all">
                  Edit Addresses
               </button>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
               <div className="flex items-center gap-2 mb-3 text-orange-600">
                  <ShieldCheck size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Loyalty Perks</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Earn points on every purchase. Redemptions start from 100 points for a RM2 discount.
               </p>
               <div className="mt-4 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[20%]"></div>
               </div>
               <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase">80 pts until next reward</p>
            </div>
         </div>
      </div>
    </div>
  );
}