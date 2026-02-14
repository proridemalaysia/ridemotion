"use client";
import React from 'react';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, LogOut 
} from 'lucide-react';
import { clsx } from 'clsx';
import { signOutAction } from '@/app/login/actions';

interface MemberProfileViewProps {
  initialProfile: any;
  initialOrders: any[];
}

export default function MemberProfileView({ initialProfile, initialOrders }: MemberProfileViewProps) {
  
  const isUserAdmin = initialProfile?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 mt-6 font-sans">
      
      {/* 1. Member Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        {/* Modern decorative accent */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className={clsx(
            "w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-xl relative z-10",
            isUserAdmin ? "bg-red-600 shadow-red-900/20" : "bg-[#020617] shadow-slate-900/20"
        )}>
           <User size={48} strokeWidth={1.5} />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase italic">
            {initialProfile?.full_name || 'Member Account'}
           </h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Registered: {initialProfile?.created_at ? new Date(initialProfile.created_at).toLocaleDateString('en-MY') : '2024'}
           </p>
           
           <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Star size={18} fill="currentColor" />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-60">Loyalty Pts</p>
                    <p className="text-xl font-bold tracking-tighter">{initialProfile?.loyalty_points || 0}</p>
                 </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Package size={18} />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-60">History</p>
                    <p className="text-xl font-bold tracking-tighter">{initialOrders.length} Orders</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Server-side Sign Out */}
        <form action={signOutAction} className="md:absolute md:top-8 md:right-8">
           <button type="submit" className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 px-6 py-3 rounded-xl transition-all border border-red-100 active:scale-95 shadow-sm">
              <LogOut size={16} /> Sign Out
           </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* 2. Order History Table (High-Density) */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
               <Clock size={14} /> My Recent Orders
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <tr>
                          <th className="px-6 py-4">Order Ref</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Details</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {initialOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                             <td className="px-6 py-4 font-bold text-slate-900 uppercase tracking-tight">#ORD-{order.order_number}</td>
                             <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono tracking-tighter">RM {Number(order.total_amount).toFixed(2)}</td>
                             <td className="px-6 py-4 text-center">
                                <span className={clsx(
                                  "text-[10px] font-bold uppercase px-3 py-1 rounded-full border",
                                  order.status === 'completed' ? "bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-50" : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-50"
                                )}>
                                   {order.status}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                               <button className="text-blue-600 hover:text-blue-800 transition-colors p-1 active:scale-90">
                                 <ChevronRight size={20} />
                               </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
               {initialOrders.length === 0 && (
                  <div className="py-24 text-center">
                     <Package size={48} className="mx-auto text-slate-100 mb-4" />
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No purchase history found</p>
                  </div>
               )}
            </div>
         </div>

         {/* 3. Account Sidebar Area */}
         <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Shipping & Security</h3>
            
            <div className="bg-[#020617] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
               <MapPin className="absolute -right-6 -bottom-6 opacity-10 w-32 h-32" />
               <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><MapPin size={18} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Primary Address</span>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                  {initialProfile?.address || "No primary address recorded. Please add one to your next order for faster checkout."}
               </p>
               <button className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95">
                  Update Profile
               </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
               <div className="flex items-center gap-3 mb-4 text-orange-600">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Member</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Your account is fully integrated with the PartsHub warehouse network. Enjoy priority stock syncing and automated order tracking.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}