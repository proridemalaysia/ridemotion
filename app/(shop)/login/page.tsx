"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert(error.message);
        setLoading(false);
      } else if (data.user) {
        // FORCE a hard page change to the ERP dashboard
        window.location.assign('/admin');
      }
    } catch (err) {
      setLoading(false);
      window.location.reload(); // If it hangs, refresh automatically
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>SYSTEM LOGIN</h2>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            required type="email" placeholder="Email" 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            required type="password" placeholder="Password" 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '14px', borderRadius: '8px', border: 'none', background: loading ? '#ccc' : '#000', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? "CONNECTING..." : "ENTER ERP"}
          </button>
        </form>
        
        <p style={{ fontSize: '10px', color: '#999', marginTop: '20px', textAlign: 'center' }}>
          Error bypass active. If the button fails, please refresh.
        </p>
      </div>
    </div>
  );
}