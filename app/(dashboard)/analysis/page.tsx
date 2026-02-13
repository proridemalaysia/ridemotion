"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Save, RotateCcw, FolderOpen, FileSpreadsheet, Printer, 
  Trash2, Package, Calculator, Truck, Percent 
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function AnalysisOrderPage() {
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftName, setDraftName] = useState("");
  
  // 1. Logistics & Tax State
  const [rates, setRates] = useState({
    exchange: 4.75,
    oceanPort: 5000,
    fwdTrucking: 800,
    isFormE: true,
    customDuty: 0,
    consumable: 2.0,
    license: 0.3
  });

  // 2. Product Selection State
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState({ brand: '', model: '', item: '', qty: 1 });
  const [manifest, setManifest] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    const { data: prods } = await supabase.from('product_variants').select('*, products(*)').order('sku');
    const { data: drfs } = await supabase.from('analysis_drafts').select('*').order('updated_at', { ascending: false });
    if (prods) setAllProducts(prods);
    if (drfs) setDrafts(drfs);
    setLoading(false);
  }

  // --- CALCULATIONS ENGINE ---
  const summary = useMemo(() => {
    const totalQty = manifest.reduce((acc, i) => acc + i.qty, 0);
    const totalCBM = manifest.reduce((acc, i) => acc + ((i.length_cm * i.width_cm * i.height_cm / 1000000) * (i.qty / i.items_per_carton)), 0);
    const totalCtns = manifest.reduce((acc, i) => acc + (i.qty / i.items_per_carton), 0);
    const totalFobUsd = manifest.reduce((acc, i) => acc + (i.buy_usd * i.qty), 0);
    const totalFobRm = totalFobUsd * rates.exchange;
    const sstTax = totalFobRm * 0.10;
    const totalLogs = rates.oceanPort + rates.fwdTrucking;
    const totalCosting = totalFobRm + sstTax + totalLogs + (totalQty * (rates.consumable + rates.license));
    
    // Profit based on target prices
    const totalRevenue = manifest.reduce((acc, i) => acc + (i.targetPrice * i.qty), 0);
    const projectedProfit = totalRevenue - totalCosting;

    return { totalQty, totalCBM, totalCtns, totalFobUsd, totalFobRm, sstTax, totalLogs, totalCosting, projectedProfit };
  }, [manifest, rates]);

  // --- ACTIONS ---
  const addItemToManifest = () => {
    const product = allProducts.find(p => p.id === filters.item);
    if (!product) return;
    
    const fobRm = product.buy_usd * rates.exchange;
    const newItem = {
      ...product,
      qty: filters.qty,
      targetPrice: product.price_proposal || 0,
    };
    setManifest([...manifest, newItem]);
  };

  const handleSetGlobalPrice = (type: 'price_sell' | 'price_online' | 'price_proposal') => {
    setManifest(manifest.map(item => ({ ...item, targetPrice: item[type] })));
  };

  const saveDraft = async () => {
    if (!draftName) return alert("Enter a draft name");
    await supabase.from('analysis_drafts').insert([{
      name: draftName,
      exchange_rate: rates.exchange,
      ocean_port_rm: rates.oceanPort,
      fwd_trucking_rm: rates.fwdTrucking,
      form_e_enabled: rates.isFormE,
      items: manifest
    }]);
    alert("Draft saved!");
    fetchInitialData();
  };

  if (loading) return <div className="p-20 text-center"><Spinner /></div>;

  return (
    <div className="p-6 flex gap-6 min-h-screen bg-[#F1F5F9]">
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 space-y-4">
        {/* Top Header Controls */}
        <div className="flex justify-between items-center gap-4 bg-white p-3 rounded-lg border shadow-sm">
          <div className="flex gap-2">
            <select className="p-2 border rounded-md text-xs font-bold bg-slate-50 outline-none">
              <option>-- Load Draft --</option>
              {drafts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={() => setManifest([])} className="p-2 border rounded-md text-slate-500 hover:bg-gray-50 flex items-center gap-1 text-xs font-bold">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input 
              placeholder="Draft Name..." 
              className="p-2 border rounded-md text-xs font-bold outline-none w-48"
              onChange={e => setDraftName(e.target.value)}
            />
            <button onClick={saveDraft} className="bg-[#0F172A] text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2">
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        {/* SUMMARY CALCULATION TABLE */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-center border-collapse text-[11px] font-bold uppercase">
            <thead className="bg-slate-200 text-slate-600 border-b">
              <tr>
                <th className="p-3 border-r">Rate / Duty</th>
                <th className="p-3 border-r">Qty</th>
                <th className="p-3 border-r">Volume</th>
                <th className="p-3 border-r text-blue-600">Fob Value</th>
                <th className="p-3 border-r text-red-600">SST Tax</th>
                <th className="p-3 border-r">Total Costing</th>
                <th className="p-3 bg-green-50 text-green-600">Projected Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <td className="p-3 border-r">USD {rates.exchange.toFixed(2)}</td>
                <td className="p-3 border-r text-lg">{summary.totalQty}</td>
                <td className="p-3 border-r text-blue-600">{summary.totalCBM.toFixed(2)} m³</td>
                <td className="p-3 border-r text-blue-600">${summary.totalFobUsd.toLocaleString()}</td>
                <td className="p-3 border-r text-red-600">RM {summary.sstTax.toLocaleString()}</td>
                <td className="p-3 border-r text-orange-600 italic">LOGS: RM {summary.totalLogs.toLocaleString()}</td>
                <td className="p-3 bg-green-50 text-green-600 text-lg">RM {summary.projectedProfit.toLocaleString()}</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 border-r text-slate-400">{rates.isFormE ? '0% (Form E)' : `${rates.customDuty}% Duty`}</td>
                <td className="p-3 border-r text-slate-400 font-medium">Units</td>
                <td className="p-3 border-r text-slate-400 font-medium">{summary.totalCtns.toFixed(1)} Ctns</td>
                <td className="p-3 border-r font-bold">RM {summary.totalFobRm.toLocaleString()}</td>
                <td className="p-3 border-r text-slate-400 font-medium">SST (10%)</td>
                <td className="p-3 border-r text-lg">RM {summary.totalCosting.toLocaleString()}</td>
                <td className="p-3 bg-green-50 text-slate-400 font-medium italic">(If sold at Target Price)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PRODUCT PICKER */}
        <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-12 gap-4 items-end">
           <div className="col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Brand</label>
              <select className="w-full p-2 border rounded-md text-xs font-bold" onChange={e => setFilters({...filters, brand: e.target.value})}>
                <option value="">Select Brand</option>
                {[...new Set(allProducts.map(p => p.products?.brand_name))].sort().map(b => <option key={b} value={b}>{b}</option>)}
              </select>
           </div>
           <div className="col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Model</label>
              <select className="w-full p-2 border rounded-md text-xs font-bold" onChange={e => setFilters({...filters, model: e.target.value})}>
                <option value="">Select Model</option>
                {[...new Set(allProducts.filter(p => p.products?.brand_name === filters.brand).map(p => p.products?.model_name))].sort().map(m => <option key={m} value={m}>{m}</option>)}
              </select>
           </div>
           <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Item</label>
              <select className="w-full p-2 border rounded-md text-xs font-bold" onChange={e => setFilters({...filters, item: e.target.value})}>
                <option value="">Select Item SKU</option>
                {allProducts.filter(p => p.products?.model_name === filters.model).sort((a,b) => a.sku.localeCompare(b.sku)).map(p => <option key={p.id} value={p.id}>[{p.sku}] {p.products?.name}</option>)}
              </select>
           </div>
           <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Qty</label>
              <input type="number" className="w-full p-2 border rounded-md text-xs font-bold" value={filters.qty} onChange={e => setFilters({...filters, qty: parseInt(e.target.value)})} />
           </div>
           <div className="col-span-1">
              <button onClick={addItemToManifest} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-all flex justify-center"><Plus/></button>
           </div>
        </div>

        {/* SHIPMENT MANIFEST TABLE */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800 text-sm uppercase italic">Shipment Manifest</h3>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Set Price:</span>
                 {['sell', 'online', 'proposal'].map(p => (
                   <button 
                    key={p} 
                    onClick={() => handleSetGlobalPrice(`price_${p}` as any)}
                    className="px-3 py-1 border rounded text-[10px] font-bold uppercase hover:bg-slate-50"
                   >
                    {p.replace('price_', '')}
                   </button>
                 ))}
              </div>
              <div className="flex gap-2">
                 <button className="flex items-center gap-1 text-[10px] font-bold text-green-600 border border-green-200 px-3 py-1 rounded bg-green-50"><FileSpreadsheet size={14}/> Excel</button>
                 <button onClick={() => window.print()} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 border border-blue-200 px-3 py-1 rounded bg-blue-50"><Printer size={14}/> Print PDF</button>
              </div>
            </div>
          </div>

          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tighter">
              <tr>
                <th className="px-4 py-3">Item Details</th>
                <th className="px-2 py-3 text-center bg-yellow-50/50">Qty</th>
                <th className="px-2 py-3 text-center">Ctn</th>
                <th className="px-2 py-3 text-center">CBM</th>
                <th className="px-2 py-3 text-right">Cost(USD)</th>
                <th className="px-2 py-3 text-right">Fob(RM)</th>
                <th className="px-2 py-3 text-right text-blue-600">Landed</th>
                <th className="px-2 py-3 text-center">Target Price</th>
                <th className="px-2 py-3 text-right text-green-600">Profit</th>
                <th className="px-2 py-3 text-center">Margin</th>
                <th className="px-4 py-3 text-right">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {manifest.map((item, idx) => {
                const fobRm = item.buy_usd * rates.exchange;
                const landed = fobRm + (fobRm * 0.10) + (rates.oceanPort / summary.totalQty) + rates.consumable + rates.license;
                const profit = item.targetPrice - landed;
                const margin = (profit / item.targetPrice) * 100;

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-slate-400 text-[9px] uppercase font-medium">{item.products.brand_name} {item.products.model_name}</p>
                      <p className="font-bold text-slate-800 uppercase">{item.sku}</p>
                      <p className="text-slate-400 italic">{item.products.name}</p>
                    </td>
                    <td className="px-2 py-3 text-center bg-yellow-50/50">
                       <input type="number" className="w-12 p-1 border rounded text-center font-bold" value={item.qty} onChange={e => {
                         const newManifest = [...manifest];
                         newManifest[idx].qty = parseInt(e.target.value);
                         setManifest(newManifest);
                       }} />
                    </td>
                    <td className="px-2 py-3 text-center font-medium">{(item.qty / item.items_per_carton).toFixed(2)}</td>
                    <td className="px-2 py-3 text-center font-medium">{(item.length_cm * item.width_cm * item.height_cm / 1000000).toFixed(3)}</td>
                    <td className="px-2 py-3 text-right text-slate-400">{item.buy_usd.toFixed(2)}</td>
                    <td className="px-2 py-3 text-right text-slate-500 font-medium">{fobRm.toFixed(2)}</td>
                    <td className="px-2 py-3 text-right font-bold text-blue-600">{landed.toFixed(2)}</td>
                    <td className="px-2 py-3 text-center">
                       <input type="number" className="w-16 p-1 border rounded text-center font-bold" value={item.targetPrice} onChange={e => {
                         const newManifest = [...manifest];
                         newManifest[idx].targetPrice = parseFloat(e.target.value);
                         setManifest(newManifest);
                       }} />
                    </td>
                    <td className="px-2 py-3 text-right font-bold text-green-600">{profit.toFixed(2)}</td>
                    <td className="px-2 py-3 text-center font-bold">{margin.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">
                       <button onClick={() => setManifest(manifest.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SIDEBAR: LOGISTICS & TAX */}
      <div className="w-[280px] space-y-4 shrink-0 print:hidden">
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
           <h3 className="font-bold flex items-center gap-2 text-slate-800 border-b pb-3 uppercase tracking-widest text-xs">
              <Truck size={16} /> Logistics & Tax
           </h3>

           <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <label className="text-[10px] font-bold text-blue-600 uppercase mb-2 block">Exchange Rate (USD)</label>
              <input 
                type="number" step="0.01"
                className="w-full bg-transparent text-2xl font-black text-slate-900 outline-none"
                value={rates.exchange}
                onChange={e => setRates({...rates, exchange: parseFloat(e.target.value)})}
              />
           </div>

           <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ocean & Port (RM)</label>
              <input type="number" className="w-full p-2.5 border rounded-md text-sm font-bold bg-slate-50" value={rates.oceanPort} onChange={e => setRates({...rates, oceanPort: parseFloat(e.target.value)})} />
           </div>

           <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">FWD & Trucking (RM)</label>
              <input type="number" className="w-full p-2.5 border rounded-md text-sm font-bold bg-slate-50" value={rates.fwdTrucking} onChange={e => setRates({...rates, fwdTrucking: parseFloat(e.target.value)})} />
           </div>

           <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Form E (0% Duty)</span>
              <input 
                type="checkbox" checked={rates.isFormE} 
                className="w-4 h-4 rounded text-blue-600"
                onChange={e => setRates({...rates, isFormE: e.target.checked})}
              />
           </div>

           {!rates.isFormE && (
             <div className="animate-in slide-in-from-top-1">
                <label className="text-[10px] font-bold text-red-500 uppercase mb-1 block">Custom Duty %</label>
                <input type="number" className="w-full p-2.5 border border-red-100 rounded-md text-sm font-bold bg-red-50/30" value={rates.customDuty} onChange={e => setRates({...rates, customDuty: parseFloat(e.target.value)})} />
             </div>
           )}

           <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Consumable</label>
                 <input type="number" className="w-full p-2 border rounded-md text-xs font-bold" value={rates.consumable} onChange={e => setRates({...rates, consumable: parseFloat(e.target.value)})} />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">License</label>
                 <input type="number" className="w-full p-2 border rounded-md text-xs font-bold" value={rates.license} onChange={e => setRates({...rates, license: parseFloat(e.target.value)})} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}