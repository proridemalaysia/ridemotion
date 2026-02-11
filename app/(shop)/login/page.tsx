"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Package, ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Force clear any old sessions on first load
  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    const { data, error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (type === 'signup') {
      alert("Account created! Now logging you in...");
      // For signups, we give the DB a second to run the trigger
      setTimeout(() => router.push('/inventory'), 1500);
    } else {
      router.push('/inventory');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg rotate-3">
            <Package size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">PARTSHUB ERP</h2>
        <p className="text-gray-400 text-sm font-medium">Internal Management Portal</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
          <input type="email" className="w-full p-4 border rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm" 
            placeholder="admin@partshub.com" onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
          <input type="password" name="password" className="w-full p-4 border rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm" 
            placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => handleAuth('login')}
            disabled={loading}
            className="bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            {loading ? <Spinner /> : <LogIn size={18} />} Sign In
          </button>
          <button 
            onClick={() => handleAuth('signup')}
            disabled={loading}
            className="bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <UserPlus size={18} /> Register
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-2xl flex gap-3 items-start">
          <ShieldCheck className="text-blue-600 mt-1" size={20} />
          <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
            This portal is for authorized staff only. New registrations will be automatically assigned <b>Admin</b> privileges during development.
          </p>
        </div>
      </div>
    </div>
  );
}