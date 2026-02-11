"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Percent, Save, ShieldCheck } from 'lucide-react';
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

  const handleSave = async (table: string, data: any) => {
    setUpdating(true);
    const { error } = await supabase.from(table).update(data).eq('id', data.id);
    if (error) alert(error.message);
    else alert("Settings saved successfully.");
    setUpdating(false);
  };

  if (loading) return <div className="p-20 text-center"><Spinner /></div>;

  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";
  const inputClass = "w-full p-2.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all";

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500 text-sm">Configure your company profile and automated pricing logic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Identity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
             <Building2 size={18} className="text-blue-600" />
             <h3 className="font-semibold text-slate-800">Business Identity</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Company Name</label>
              <input className={inputClass} value={settings?.company_name} onChange={e => setSettings({...settings, company_name: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Registration Address</label>
              <textarea rows={3} className={inputClass} value={settings?.company_address} onChange={e => setSettings({...settings, company_address: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Tax / SST ID</label>
              <input className={inputClass} value={settings?.tax_id} onChange={e => setSettings({...settings, tax_id: e.target.value})} />
            </div>
            <button 
              onClick={() => handleSave('global_settings', settings)}
              disabled={updating}
              className="w-full bg-slate-800 text-white py-2 rounded text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              {updating ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </div>

        {/* Pricing Rules */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
             <Percent size={18} className="text-orange-600" />
             <h3 className="font-semibold text-slate-800">Automation Rules</h3>
          </div>

          <div className="space-y-4">
             <div className="p-4 bg-orange-50 rounded border border-orange-100">
                <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                  These markups are applied when using the "Stock In" or "Recalculate Prices" features.
                </p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Retail Markup %</label>
                  <input type="number" className={inputClass} value={pricing?.default_retail_markup_percent} onChange={e => setPricing({...pricing, default_retail_markup_percent: parseFloat(e.target.value)})}/>
                </div>
                <div>
                  <label className={labelClass}>Online Markup %</label>
                  <input type="number" className={inputClass} value={pricing?.default_online_markup_percent} onChange={e => setPricing({...pricing, default_online_markup_percent: parseFloat(e.target.value)})}/>
                </div>
             </div>
             <button 
              onClick={() => handleSave('system_settings', pricing)}
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 shadow-sm"
             >
              Save Pricing Rules
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}