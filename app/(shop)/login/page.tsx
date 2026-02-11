"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, Package, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return alert("Please enter email and password");
    setLoading(true);
    
    try {
      if (type === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: email.split('@')[0] } }
        });
        if (error) throw error;
        alert("Registration success! You are now a Customer. Log in again after Admin promotion.");
        window.location.reload();
      } else {
        // LOGIN LOGIC
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          // Give Supabase a moment to ensure the session is written to cookies
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Fetch the role
          const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (pError || !profile) {
            console.error("Profile Error:", pError);
            window.location.replace('/?auth_success=true');
            return;
          }

          console.log("Logged in as role:", profile.role);

          if (profile.role === 'admin' || profile.role === 'staff') {
            // Use a timestamp to force the Middleware to re-evaluate the role
            window.location.replace(`/admin?refresh=${Date.now()}`);
          } else {
            window.location.replace('/');
          }
        }
      }
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="bg-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-orange-200">
            <Package size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">PARTSHUB ERP</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Production Access Point</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Email</label>
          <input 
            type="email" 
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none text-sm font-bold shadow-inner transition-all" 
            value={email}
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none text-sm font-bold shadow-inner transition-all" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-10 text-slate-400 hover:text-orange-600"
          >
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            onClick={() => handleAuth('login')} 
            disabled={loading} 
            className="bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Spinner size={16} /> : <LogIn size={18} />} Sign In
          </button>
          <button 
            onClick={() => handleAuth('signup')} 
            disabled={loading} 
            className="bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={18} /> Register
          </button>
        </div>

        <div className="mt-8 p-5 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4 items-start shadow-sm shadow-blue-50">
          <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
          <div className="text-[11px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
            System ID: <span className="text-blue-500 font-black">Online</span>
            <p className="mt-1 font-medium normal-case text-blue-600">If the redirect hangs, please wait 3 seconds and refresh the browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}