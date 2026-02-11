"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wrench, Percent, Save, Building2, Phone, Mail, MapPin, Hash, ShieldCheck } from 'lucide-react';
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
    const [configRes, priceRes] = await Promise.all([
      supabase.from('global_settings').select('*').eq('id', 'current_config').single(),
      supabase.from('system_settings').select('*').eq('id', 'pricing_rules').single()
    ]);
    if (configRes.data) setSettings(configRes.data);
    if (priceRes.data) setPricing(priceRes.data);
    setLoading(false);
  }

  const saveBusinessProfile = async () => {
    setUpdating(true);
    const { error } = await supabase.from('global_settings').update(settings).eq('id', 'current_config');
    if (error) alert(error.message);
    else alert("Business profile updated successfully!");
    setUpdating(false);
  };

  const savePricingRules = async () => {
    setUpdating(true);
    const { error } = await supabase.from('system_settings').update(pricing).eq('id', 'pricing_rules');
    if (error) alert(error.message);
    else alert("Pricing logic updated!");
    setUpdating(false);
  };

  if (loading) return <div className="p-20 text-center"><Spinner className="mx-auto" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">System Control Panel</h2>
        <p className="text-slate-400 text-sm font-medium">Manage global identity and automated engines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Business Identity Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Building2 size={24}/></div>
             <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Official Business Profile</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Company Legal Name</label>
              <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={settings?.company_name} onChange={e => setSettings({...settings, company_name: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Registration Address (For Invoices)</label>
              <textarea rows={3} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={settings?.company_address} onChange={e => setSettings({...settings, company_address: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2"><Phone size={10} className="inline mr-1"/> Phone Number</label>
              <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={settings?.company_phone} onChange={e => setSettings({...settings, company_phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2"><Hash size={10} className="inline mr-1"/> SST / Tax ID</label>
              <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={settings?.tax_id} onChange={e => setSettings({...settings, tax_id: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={saveBusinessProfile}
            disabled={updating}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            {updating ? <Spinner size={16}/> : <Save size={18}/>} Save Identity Settings
          </button>
        </div>

        {/* 2. Side Panel Pricing Logic */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <Percent size={20} className="text-blue-400" />
                <h3 className="font-black uppercase text-xs tracking-widest">Auto Pricing Logic</h3>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Retail Markup %</label>
                  <input type="number" className="w-full bg-white/10 border border-white/10 p-3 rounded-xl font-black text-blue-400 outline-none" value={pricing?.default_retail_markup_percent} onChange={e => setPricing({...pricing, default_retail_markup_percent: parseFloat(e.target.value)})}/>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Online Markup %</label>
                  <input type="number" className="w-full bg-white/10 border border-white/10 p-3 rounded-xl font-black text-orange-400 outline-none" value={pricing?.default_online_markup_percent} onChange={e => setPricing({...pricing, default_online_markup_percent: parseFloat(e.target.value)})}/>
                </div>
                <button onClick={savePricingRules} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest mt-4">Update Logic</button>
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
             <div className="flex gap-3 text-blue-800">
                <ShieldCheck size={24} className="shrink-0" />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1">Audit Protocol</p>
                   <p className="text-xs font-medium leading-relaxed">Changes to global settings are logged. Ensure SST IDs match your official registration documents.</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}