"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("System Status: Ready");
  const [loading, setLoading] = useState(false);

  // GHOST ERROR SUPPRESSOR: 
  // This code catches the "app.js" error before it can freeze the page.
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message.includes('onclick') || e.filename.includes('app.js')) {
        console.warn("Caught ghost script error, suppressing to keep app running.");
        e.preventDefault();
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("Checking credentials...");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setMsg("Login Failed: " + error.message);
        setLoading(false);
      } else if (data.user) {
        setMsg("Success! Accessing ERP...");
        // Use window.location to completely leave the current page and its errors
        window.location.assign('/admin');
      }
    } catch (err) {
      setMsg("Critical System Error. Please refresh.");
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc',
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontWeight: 900, fontSize: '24px', color: '#0f172a', marginBottom: '8px' }}>
          PARTSHUB ERP
        </h2>
        <p style={{ 
          color: msg.includes('Error') ? '#ef4444' : '#64748b', 
          fontSize: '12px', 
          fontWeight: 'bold',
          marginBottom: '32px',
          textTransform: 'uppercase'
        }}>
          {msg}
        </p>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            required
            type="email" 
            placeholder="Email Address" 
            autoComplete="email"
            style={{ 
              padding: '12px 16px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              fontSize: '14px',
              outline: 'none'
            }}
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            required
            type="password" 
            placeholder="Password" 
            autoComplete="current-password"
            style={{ 
              padding: '12px 16px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              fontSize: '14px',
              outline: 'none'
            }}
            onChange={e => setPassword(e.target.value)} 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '14px', 
              backgroundColor: loading ? '#94a3b8' : '#0f172a', 
              color: 'white', 
              borderRadius: '12px', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>
        
        <p style={{ marginTop: '24px', fontSize: '11px', color: '#94a3b8' }}>
          If the button doesn't respond, please wait 3 seconds and try again.
        </p>
      </div>
    </div>
  );
}