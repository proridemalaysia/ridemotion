"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Star, Package, Clock, ShieldCheck, MapPin, Truck, ExternalLink } from 'lucide-react';
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

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} className="text-orange-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
        <div className="w-32 h-32 bg-slate-900 rounded-3xl flex items-center justify-center text-white relative z-10 shadow-2xl">
           <User size={60} strokeWidth={1} />
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
           <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">{profile?.full_name || 'Valued Customer'}</h1>
           <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-orange-600 text-white px-5 py-2 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-200">
                 <Star size={20} fill="currentColor" />
                 <div><p className="text-[9px] font-black uppercase tracking-widest leading-none">Loyalty Points</p><p className="text-xl font-black tracking-tighter">{profile?.loyalty_points || 0}</p></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
               <Clock size={16} className="text-orange-600" /> My Purchases
            </h3>
            {orders.map(order => (
               <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-orange-200 overflow-hidden relative group">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="font-black text-slate-800 text-sm uppercase italic">Order #ORD-{order.order_number}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-orange-600 text-xl tracking-tighter italic">RM {order.total_amount.toFixed(2)}</p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {order.status}
                        </span>
                     </div>
                  </div>

                  {/* Tracking Number Section */}
                  {order.tracking_number && (
                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between bg-blue-50/50 -mx-6 -mb-6 p-6">
                       <div className="flex items-center gap-3">
                          <div className="bg-blue-600 p-2 rounded-lg text-white"><Truck size={18}/></div>
                          <div>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Courier: {order.courier_name}</p>
                             <p className="text-sm font-black text-slate-800 tracking-tight">{order.tracking_number}</p>
                          </div>
                       </div>
                       <button className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2">
                          Track Parcel <ExternalLink size={14}/>
                       </button>
                    </div>
                  )}
               </div>
            ))}
            {orders.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 font-bold italic">No orders found.</div>}
         </div>

         <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <MapPin className="absolute -right-4 -bottom-4 opacity-10 w-32 h-32" />
               <h3 className="font-black uppercase text-[10px] tracking-widest text-blue-400 mb-4">Default Shipping</h3>
               <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"You can update your default address in the account settings."</p>
            </div>
         </div>
      </div>
    </div>
  );
}