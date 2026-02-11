"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, Package, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        // BYPASS ALL CHECKS: Go straight to admin
        window.location.replace('/admin');
      }
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-2xl border">
      <div className="text-center mb-10">
        <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Package size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase italic">Admin Login</h2>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
          <input required type="email" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Password</label>
          <input required type={showPassword ? "text" : "password"} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-300">
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
          {loading ? <Spinner size={16} /> : <LogIn size={18} />} Enter ERP System
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex gap-3 items-center border border-blue-100">
        <ShieldCheck className="text-blue-600" size={20} />
        <p className="text-[10px] text-blue-800 font-bold uppercase tracking-tight">Accessing Secure Production Instance</p>
      </div>
    </div>
  );
}