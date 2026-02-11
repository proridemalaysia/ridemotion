"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready for Secure Login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Authenticating...");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setStatus("Error: " + error.message);
        setLoading(false);
      } else if (data.user) {
        setStatus("Success! Entering Dashboard...");
        // This is the strongest redirect method available
        window.location.assign('/admin');
      }
    } catch (err) {
      setStatus("System busy. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 900, fontSize: '22px', marginBottom: '5px', letterSpacing: '-0.5px' }}>PARTSHUB ERP</h2>
        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '30px', textTransform: 'uppercase' }}>{status}</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            style={{ padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '600' }}
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            required 
            type="password" 
            placeholder="Password" 
            style={{ padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '600' }}
            onChange={e => setPassword(e.target.value)} 
          />
          
          {/* type="submit" ensures the form triggers even if hydration is delayed */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              border: 'none', 
              background: loading ? '#cbd5e1' : '#0f172a', 
              color: '#fff', 
              cursor: 'pointer', 
              fontWeight: '900',
              fontSize: '13px',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? "CONNECTING..." : "SIGN IN TO SYSTEM"}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '10px', color: '#cbd5e1', fontWeight: 'bold' }}>
          SECURE PRODUCTION INSTANCE v1.0
        </p>
      </div>
    </div>
  );
}