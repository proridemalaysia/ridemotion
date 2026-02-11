"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, Package, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showManualLink, setShowManualLink] = useState(false);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return alert("Enter email and password");
    setLoading(true);
    
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Account created! You are now a Customer. Please sign in.");
        setLoading(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          // After login, show the manual link after 2 seconds in case redirect hangs
          setTimeout(() => setShowManualLink(true), 2000);

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'admin' || profile?.role === 'staff') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
          }
        }
      }
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100">
      <div className="text-center mb-10">
        <div className="bg-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white">
            <Package size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase italic">PartsHub ERP</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
          <input type="email" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input type={showPassword ? "text" : "password"} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400">
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button onClick={() => handleAuth('login')} disabled={loading} className="bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2">
            {loading ? <Spinner size={16} /> : <LogIn size={18} />} Sign In
          </button>
          <button onClick={() => handleAuth('signup')} disabled={loading} className="bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2">
            <UserPlus size={18} /> Register
          </button>
        </div>

        {/* EMERGENCY REDIRECT LINK (Shows only if browser hangs) */}
        {showManualLink && (
          <div className="mt-4 animate-bounce">
            <button 
              onClick={() => window.location.href = '/admin'}
              className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xl"
            >
              Redirecting taking too long? Click here <ArrowRight size={16}/>
            </button>
          </div>
        )}

        <div className="mt-8 p-5 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4 items-start shadow-sm">
          <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
          <p className="text-[11px] text-blue-800 font-bold uppercase leading-relaxed">
            Ensure your role is set to <b>admin</b> in the Supabase Table Editor to enter the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}