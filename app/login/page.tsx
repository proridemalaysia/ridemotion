"use client";
import React, { useState } from 'react';
import { login, signup } from './actions';
import { Package, ShieldCheck, UserPlus, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Top Header */}
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="bg-[#020617] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg rotate-3 hover:rotate-0 transition-transform">
            <Package size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase italic">PartsHub</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            {isRegistering ? 'Create New Account' : 'Secure Access Point'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-semibold animate-shake">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-600 text-xs font-semibold">
              <CheckCircle2 size={16} /> {message}
            </div>
          )}

          <form action={async (formData) => {
            setLoading(true);
            if (isRegistering) await signup(formData);
            else await login(formData);
            setLoading(false);
          }} className="space-y-4">
            
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" required type="text" placeholder="e.g. John Doe"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input 
                name="email" required type="email" placeholder="name@company.com"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input 
                name="password" required type={showPassword ? "text" : "password"} placeholder="••••••••••••"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-[#020617] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2 italic lowercase tracking-normal">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isRegistering ? <UserPlus size={16} /> : <LogIn size={16} />}
                  <span>{isRegistering ? 'Register Account' : 'Sign In'}</span>
                </div>
              )}
            </button>
          </form>

          {/* Toggle View */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New Staff? Create an Account'}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <ShieldCheck className="text-blue-600" size={20} />
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            All logins are monitored via the Admin Audit Trail. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
      
      <p className="mt-10 text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em]">PartsHub ERP v1.0.4</p>
    </div>
  );
}

// Icon for messages
const CheckCircle2 = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);