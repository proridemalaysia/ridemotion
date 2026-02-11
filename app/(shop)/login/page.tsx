"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Package, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clear any existing stale sessions on mount
  useEffect(() => {
    const clearSession = async () => {
      await supabase.auth.signOut();
    };
    clearSession();
  }, []);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: { full_name: email.split('@')[0] } // Default name from email
            }
          });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (type === 'signup') {
        alert("Account created successfully! Promoting you to Admin now...");
        // Wait a moment for the DB trigger to finish
        setTimeout(() => {
          window.location.href = "/"; // Send to shop first, you will promote via Supabase next
        }, 1000);
      } else {
        // For Login: Check role to decide where to send them
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user?.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      alert("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="bg-orange-600 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-orange-200 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Package size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">PartsHub ERP</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Unified Management Portal</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email Address</label>
          <input 
            type="email" 
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold shadow-inner" 
            placeholder="admin@company.com" 
            value={email}
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Security Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold shadow-inner" 
            placeholder="••••••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-10 text-slate-400 hover:text-orange-600 transition-colors"
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
            className="bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <UserPlus size={18} /> Register
          </button>
        </div>

        <div className="mt-8 p-5 bg-blue-50 rounded-[24px] border border-blue-100 flex gap-4 items-start shadow-sm">
          <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
          <p className="text-[11px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
            Security Notice: New registrations default to <b>Customer</b> status. Admin promotion is required via the database console.
          </p>
        </div>
      </div>
    </div>
  );
}