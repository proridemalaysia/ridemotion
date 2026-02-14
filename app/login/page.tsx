"use client";
import React, { useState, Suspense } from 'react';
import { login, signup } from './actions';
import { Package, ShieldCheck, UserPlus, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* Header */}
      <div className="p-10 text-center bg-slate-50 border-b border-slate-100">
        <div className="bg-[#020617] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl rotate-3 hover:rotate-0 transition-transform">
          <Package size={36} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase italic">PartsHub</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
          {isRegistering ? 'Account Registration' : 'Management Portal'}
        </p>
      </div>

      <div className="p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-bounce">
            <AlertCircle size={18} /> {decodeURIComponent(error)}
          </div>
        )}
        
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-xs font-bold">
            <CheckCircle2 size={18} /> {decodeURIComponent(message)}
          </div>
        )}

        <form action={async (formData) => {
          setLoading(true);
          if (isRegistering) await signup(formData);
          else await login(formData);
          setLoading(false);
        }} className="space-y-5">
          
          {isRegistering && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input 
                name="fullName" required type="text" placeholder="Enter your full name"
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all shadow-inner font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              name="email" required type="email" placeholder="name@company.com"
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all shadow-inner font-medium"
            />
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              name="password" required type={showPassword ? "text" : "password"} placeholder="••••••••••••"
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all shadow-inner font-medium"
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#020617] text-white py-5 rounded-[24px] font-bold text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-300 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2 italic lowercase tracking-normal">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                <span>{isRegistering ? 'Register Now' : 'Sign In'}</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">
            {isRegistering ? 'Already a member?' : 'New to the system?'}
          </p>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95"
          >
            {isRegistering ? 'Return to Sign In' : 'Create Staff / Customer Account'}
          </button>
        </div>
      </div>

      <div className="p-8 bg-blue-50/50 flex items-start gap-4">
        <ShieldCheck className="text-blue-600 shrink-0" size={24} />
        <p className="text-[11px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
          Enterprise Security Active. 
          <span className="block font-medium normal-case text-blue-600 mt-1 italic">Login sessions are encrypted and logged for auditing.</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Security Module...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}