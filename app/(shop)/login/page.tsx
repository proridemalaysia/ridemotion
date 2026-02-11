"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("Status: Ready");

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setMsg("Attempting Login...");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Success! Redirecting...");
      // Hard redirect that doesn't use React routing
      window.location.replace('/admin');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>PARTSHUB EMERGENCY ACCESS</h2>
      <p>{msg}</p>
      
      <form onSubmit={handleAuth} style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Email" p-2 border onChange={e => setEmail(e.target.value)} style={{ padding: '10px' }} />
        <input type="password" placeholder="Password" p-2 border onChange={e => setPassword(e.target.value)} style={{ padding: '10px' }} />
        
        {/* We use a simple HTML Submit button, no complex JS logic */}
        <button type="submit" style={{ padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
          LOGIN TO SYSTEM
        </button>
      </form>
      
      <div style={{ marginTop: '50px' }}>
        <p style={{ color: 'red', fontSize: '10px' }}>If button fails, check console for app.js errors.</p>
      </div>
    </div>
  );
}