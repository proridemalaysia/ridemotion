"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/Spinner';
import { Truck, TrendingUp, BarChart3, Info, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx'; // Added this missing import

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      // Joining 'products' to get the name for each variant
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products (
            name
          )
        `);
      
      if (error) {
        console.error("Report Fetch Error:", error);
      }
      
      if (variants) {
        setData(variants);
      }
      setLoading(false);
    }
    fetchReport();
  }, []);

  // Calculate CBM for one variant: (L * W * H) / 1,000,000
  const calculateCBM = (l: number, w: number, h: number) => {
    if (!l || !w || !h) return 0;
    return (Number(l) * Number(w) * Number(h)) / 1000000; 
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Business Intelligence</h2>
          <p className="text-slate-400 text-sm font-medium">Detailed Profit & Logistics Analysis</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
           <BarChart3 size={20} className="text-blue-600" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
             Live Sync:<br/><span className="text-slate-800">Operational</span>
           </span>
        </div>
      </div>

      {/* Main Analysis Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Product Details</th>
                <th className="px-6 py-5">Cost (RM)</th>
                <th className="px-6 py-5">Retail (RM)</th>
                <th className="px-6 py-5 text-blue-600">Profit / Item</th>
                <th className="px-6 py-5 text-orange-600">Margin %</th>
                <th className="px-8 py-5">Unit CBM (m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Spinner size={32} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating BI Data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-slate-400 font-bold uppercase text-xs">
                    No data available for analysis. Add products first.
                  </td>
                </tr>
              ) : data.map((variant) => {
                // Defensive logic for calculations
                const productName = variant.products?.name || "Unnamed Product";
                const cost = Number(variant.cost_price) || 0;
                const sell = Number(variant.price_sell) || 0;
                const profit = sell - cost;
                const margin = sell > 0 ? (profit / sell) * 100 : 0;
                const cbm = calculateCBM(variant.length_cm, variant.width_cm, variant.height_cm);

                return (
                  <tr key={variant.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {!variant.products && <AlertCircle size={14} className="text-red-500" title="Missing Product Link" />}
                        {productName}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU: {variant.sku}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium italic">RM {cost.toFixed(2)}</td>
                    <td className="px-6 py-5 text-slate-800 font-bold underline decoration-slate-100 underline-offset-4">RM {sell.toFixed(2)}</td>
                    <td className="px-6 py-5">
                      <span className="text-blue-600 font-black italic">RM {profit.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={clsx(
                              "h-full transition-all duration-1000",
                              margin > 30 ? "bg-emerald-500" : margin > 15 ? "bg-blue-500" : "bg-orange-500"
                            )} 
                            style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-700">{margin.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                        <Truck size={14} className="text-slate-300"/>
                        {cbm > 0 ? cbm.toFixed(4) : "N/A"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer Info Box */}
      <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-200">
         <div className="flex items-center gap-5">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20"><Info size={28}/></div>
            <div>
               <h4 className="font-black uppercase text-sm italic tracking-[0.2em] text-blue-400">BI Reference Guide</h4>
               <p className="text-xs font-medium text-slate-400 max-w-md leading-relaxed">
                 Margins are calculated using Retail POS price as the base. 
                 CBM formula applied: <span className="text-white font-bold ml-1">(L × W × H) ÷ 1,000,000.</span>
               </p>
            </div>
         </div>
         <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-xs transition-all uppercase tracking-widest border border-white/5 active:scale-95"
            >
              Print Report
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest"
            >
              Export Excel
            </button>
         </div>
      </div>
    </div>
  );
}