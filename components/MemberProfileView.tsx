"use client";
import React, { useState } from 'react';
import { 
  User, Star, Package, Clock, ShieldCheck, 
  MapPin, Truck, ExternalLink, ChevronRight, Save, X, ImageIcon 
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '@/lib/supabase';

export default function MemberProfileView({ initialProfile, initialOrders }: any) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    avatar_url: profile?.avatar_url || ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', profile.id)
      .select()
      .single();

    if (!error) {
      setProfile(data);
      setIsEditing(false);
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 mt-6 font-sans">
      
      {/* 1. Member Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
        
        {/* Profile Image Support */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-xl relative z-10 overflow-hidden bg-[#020617]">
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
            {/* FIXED: Dynamic Year */}
            Registered Member • Since {new Date(profile?.created_at).getFullYear()}
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
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
               <Clock size={14} /> Recent Transactions
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Order Ref</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Details</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {initialOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-6 py-4 font-bold text-slate-900 uppercase">#ORD-{order.order_number}</td>
                           <td className="px-6 py-4 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString('en-MY')}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-900 italic">RM {Number(order.total_amount).toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={clsx(
                                "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border",
                                order.status === 'completed' ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                              )}>
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                               <ChevronRight size={20} className="text-slate-300 ml-auto" />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Shipping & Security</h3>
            
            <div className="bg-[#020617] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
               <MapPin className="absolute -right-6 -bottom-6 opacity-10 w-32 h-32" />
               <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><MapPin size={18} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Primary Address</span>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed font-medium italic mb-8">
                  {profile?.address || "No primary address recorded. Please update your profile for faster checkout."}
               </p>
               {/* FIXED: Update Profile Button Works Now */}
               <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95"
               >
                  Update Profile
               </button>
            </div>
         </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdateProfile} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 uppercase italic">Edit Profile</h3>
                <button type="button" onClick={() => setIsEditing(false)} className="p-1 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
             </div>
             <div className="p-8 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Phone Number</label>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Profile Image URL (ImgBB)</label>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} placeholder="https://i.ibb.co/..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Shipping Address</label>
                  <textarea rows={3} className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  {loading ? 'Saving...' : <><Save size={16}/> Update My Profile</>}
                </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
}