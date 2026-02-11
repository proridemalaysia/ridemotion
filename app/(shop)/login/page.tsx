"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Starting login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("Login success, redirecting...");
        // This is a direct browser command to change the page
        // It does not depend on React or any other scripts
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error("Crash:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', fontFamily: 'sans-serif', border: '1px solid #eee', borderRadius: '20px', textAlign: 'center' }}>
      <h1 style={{ fontWeight: 900, fontSize: '24px', marginBottom: '10px' }}>PARTSHUB LOGIN</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Enter your credentials to access the ERP</p>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          required
          type="email" 
          placeholder="Email Address" 
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }}
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          required
          type="password" 
          placeholder="Password" 
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }}
          onChange={e => setPassword(e.target.value)} 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            borderRadius: '10px', 
            backgroundColor: loading ? '#ccc' : '#000', 
            color: '#fff', 
            fontWeight: 'bold', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? "AUTHENTICATING..." : "SIGN IN TO ERP"}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        New staff? Please contact the administrator.
      </div>
    </div>
  );
}