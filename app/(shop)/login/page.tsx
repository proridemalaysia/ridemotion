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

  // This is a direct, non-React-state dependent redirect
  const forceRedirect = (path: string) => {
    window.location.href = path;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!email || !password) return alert("Enter credentials");
    
    setLoading(true);
    console.log("Starting Login Flow...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // If login fails, check if user just needs to register
        if (error.message.includes("Invalid login credentials")) {
           alert("Invalid credentials. If you are new, click Register first.");
        } else {
           alert(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("Auth Success. ID:", data.user.id);
        
        // Fetch role with a fresh query
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log("Detected Role:", profile?.role);

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          forceRedirect('/admin');
        } else {
          forceRedirect('/');
        }
      }
    } catch (err) {
      console.error("Critical Crash:", err);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: email.split('@')[0] } }
    });
    
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert("Registration Successful! You are now a customer. Please Sign In.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100">
      <div className="text-center mb-10">
        <div className="bg-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
            <Package size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase italic">PartsHub ERP</h2>
      </div>

      {/* Using a standard FORM tag helps bypass JS event blockage */}
      <form onSubmit={handleAuth} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
          <input 
            required
            type="email" 
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input 
            required
            type={showPassword ? "text" : "password"} 
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400">
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            type="submit"
            disabled={loading} 
            className="bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all shadow-xl"
          >
            {loading ? <Spinner size={16} /> : <LogIn size={18} />} Sign In
          </button>
          
          <button 
            type="button"
            onClick={handleRegister}
            disabled={loading} 
            className="bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2 active:scale-95"
          >
            <UserPlus size={18} /> Register
          </button>
        </div>

        <div className="mt-8 p-5 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4 items-start">
          <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
          <p className="text-[11px] text-blue-800 font-bold uppercase leading-relaxed">
            Staff Portal: <span className="text-blue-600">Encrypted Session</span>
          </p>
        </div>
      </form>
    </div>
  );
}