"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Percent, Save, ShieldCheck, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function UtilitiesPage() {
  const [settings, setSettings] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const [configRes, priceRes] = await Promise.all([
      supabase.from('global_settings').select('*').eq('id', 'current_config').single(),
      supabase.from('system_settings').select('*').eq('id', 'pricing_rules').single()
    ]);
    if (configRes.data) setSettings(configRes.data);
    if (priceRes.data) setPricing(priceRes.data);
    setLoading(false);
  }

  const handleSave = async (table: string, data: any) => {
    setUpdating(true);
    const { error } = await supabase.from(table).update(data).eq('id', data.id);
    if (error) alert(error.message);
    else alert("Settings synchronized successfully.");
    setUpdating(false);
  };

  if (loading) return <div className="p-20 text-center"><Spinner /></div>;

  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2";
  const inputClass = "w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm";

  return (
    <div className="p-8 space-y-8 max-w-[1200px] animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">System Control Panel</h2>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global Configuration & Business Logic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Business Identity */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={20} /></div>
             <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Business Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Company Name</label>
              <input className={inputClass} value={settings?.company_name} onChange={e => setSettings({...settings, company_name: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Official Registration Address</label>
              <textarea rows={3} className={inputClass} value={settings?.company_address} onChange={e => setSettings({...settings, company_address: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Tax / SST ID</label>
              <input className={inputClass} value={settings?.tax_id} onChange={e => setSettings({...settings, tax_id: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Currency Code</label>
              <input className={inputClass} value={settings?.currency_code} onChange={e => setSettings({...settings, currency_code: e.target.value})} />
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => handleSave('global_settings', settings)}
              disabled={updating}
              className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              {updating ? <Spinner size={16}/> : <Save size={16} />} 
              Commit Identity Changes
            </button>
          </div>
        </div>

        {/* Right: Automation & Pricing */}
        <div className="space-y-6">
          <div className="bg-[#020617] p-8 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-3 mb-8">
               <Percent size={20} className="text-blue-400" />
               <h3 className="font-bold uppercase text-[10px] tracking-widest">Global Markups</h3>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">POS Retail Markup %</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl font-bold text-blue-400 outline-none focus:border-blue-500" value={pricing?.default_retail_markup_percent} onChange={e => setPricing({...pricing, default_retail_markup_percent: parseFloat(e.target.value)})}/>
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Online Shop Markup %</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl font-bold text-orange-400 outline-none focus:border-orange-500" value={pricing?.default_online_markup_percent} onChange={e => setPricing({...pricing, default_online_markup_percent: parseFloat(e.target.value)})}/>
               </div>
               <button 
                onClick={() => handleSave('system_settings', pricing)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest mt-2 hover:bg-blue-700 transition-all"
               >
                 Update Pricing Engine
               </button>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex gap-4">
             <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
             <div>
                <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-widest mb-1">Security Status</p>
                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed italic">Production instance is live. All configuration changes are logged for auditing.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}