"use client";
import React, { useState } from 'react';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, Save, X, Landmark 
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '@/lib/supabase';
import { signOutAction } from '@/app/login/actions';
import { Spinner } from './Spinner'; // Added missing import

interface MemberProfileViewProps {
  initialProfile: any;
  initialOrders: any[];
}

export default function MemberProfileView({ initialProfile, initialOrders }: MemberProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editable Form State - Now includes TIN and BRN
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    avatar_url: profile?.avatar_url || '',
    tin: profile?.tin || '',
    brn: profile?.brn || ''
  });

  // Robust Date Parser
  const getRegYear = () => {
    if (!profile?.created_at) return "2024";
    const date = new Date(profile.created_at);
    return isNaN(date.getTime()) ? "2024" : date.getFullYear();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          avatar_url: formData.avatar_url,
          tin: formData.tin,
          brn: formData.brn,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isUserAdmin = profile?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 mt-6 font-sans">
      
      {/* 1. Member Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
        
        {/* Profile Image Display */}
        <div className={clsx(
            "w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-xl relative z-10 overflow-hidden",
            isUserAdmin ? "bg-red-600" : "bg-[#020617]"
        )}>
           {profile?.avatar_url ? (
             <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
           ) : (
             <User size={48} strokeWidth={1.5} />
           )}
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase italic">
            {profile?.full_name || 'Member Account'}
           </h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Registered Member • Since {getRegYear()}
           </p>
           
           <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                 <Star size={18} fill="currentColor" />
                 <div>
                    <p className="text-[10px] font-bold uppercase leading-none opacity-60">Loyalty Balance</p>
                    <p className="text-xl font-bold tracking-tighter">{profile?.loyalty_points || 0} Pts</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* 2. Order History Table */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
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
                     {initialOrders.map((order: any) => (
                        <React.Fragment key={order.id}>
                           <tr className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 font-bold text-slate-900 uppercase">#ORD-{order.order_number}</td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString('en-MY')}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900 italic">RM {Number(order.total_amount).toFixed(2)}</td>
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
                  <span className="text-xs font-bold uppercase tracking-widest">Primary Address</span>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed font-medium italic mb-8">
                  {profile?.address || "No primary address recorded. Please update your profile for faster checkout."}
               </p>
               <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95"
               >
                  Update Profile
               </button>
            </div>

            {/* Tax Info Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
               <div className="flex items-center gap-3 mb-4 text-slate-400">
                  <Landmark size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Tax Identity</span>
               </div>
               <div className="space-y-2">
                 <p className="text-xs text-slate-600 font-medium">TIN: <span className="text-slate-900 font-bold">{profile?.tin || 'Not set'}</span></p>
                 <p className="text-xs text-slate-600 font-medium">BRN: <span className="text-slate-900 font-bold">{profile?.brn || 'Not set'}</span></p>
               </div>
            </div>
         </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdateProfile} className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
             <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-slate-800 uppercase italic text-sm">Update Information</h3>
                <button type="button" onClick={() => setIsEditing(false)} className="p-1 hover:bg-slate-200 rounded-full transition-all active:scale-95 text-slate-400"><X size={20}/></button>
             </div>
             
             <div className="p-8 space-y-5 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Full Name</label>
                        <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Phone Number</label>
                        <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Avatar Link (ImgBB)</label>
                        <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} />
                    </div>
                </div>

                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2"><Landmark size={14}/> LHDN Tax Information</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">TIN Number</label>
                            <input className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} placeholder="e.g. IG12345678" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">BRN / NRIC</label>
                            <input className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.brn} onChange={e => setFormData({...formData, brn: e.target.value})} placeholder="Business Reg No" />
                        </div>
                    </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Shipping Address</label>
                  <textarea rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <Spinner size={16}/> : <><Save size={16}/> Update My Profile</>}
                </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
}