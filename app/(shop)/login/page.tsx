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
    if (!email || !password) return alert("Enter email and password");
    setLoading(true);
    
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Account created! Please Sign In now.");
        setLoading(false);
      } else {
        console.log("Attempting login for:", email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          console.log("User authenticated, fetching profile...");
          const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (pError) {
            console.error("Profile Fetch Error:", pError);
            window.location.replace('/'); // Send to shop if profile missing
            return;
          }

          console.log("Role detected:", profile?.role);

          if (profile?.role === 'admin' || profile?.role === 'staff') {
            console.log("Redirecting to Admin...");
            window.location.href = '/admin'; // Force hard redirect
          } else {
            window.location.href = '/';
          }
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100">
      <div className="text-center mb-10">
        <div className="bg-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl rotate-3">
            <Package size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase italic">PartsHub ERP</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Internal Access</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
          <input type="email" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
          <input type={showPassword ? "text" : "password"} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400">
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button onClick={() => handleAuth('login')} disabled={loading} className="bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2 shadow-xl shadow-slate-200">
            {loading ? <Spinner size={16} /> : <LogIn size={18} />} Sign In
          </button>
          <button onClick={() => handleAuth('signup')} disabled={loading} className="bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2">
            <UserPlus size={18} /> Register
          </button>
        </div>

        <div className="mt-8 p-5 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4 items-start">
          <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
          <p className="text-[11px] text-blue-800 font-bold uppercase leading-relaxed">
            Note: Register as a customer first, then promote to Admin in the Supabase Table Editor.
          </p>
        </div>
      </div>
    </div>
  );
}