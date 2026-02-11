"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/Spinner';
import { Truck, BarChart3, Info, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`*, products (name)`);
      if (data) setData(variants || []);
      setLoading(false);
    }
    fetchReport();
  }, []);

  const calculateCBM = (l: number, w: number, h: number) => {
    if (!l || !w || !h) return 0;
    return (Number(l) * Number(w) * Number(h)) / 1000000; 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Business Intelligence</h2>
          <p className="text-slate-500 text-sm">Detailed profit margin and logistics analysis</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50">Print</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <th className="px-6 py-3">Product SKU</th>
                <th className="px-6 py-3">Cost (RM)</th>
                <th className="px-6 py-3">Retail (RM)</th>
                <th className="px-6 py-3">Profit / Unit</th>
                <th className="px-6 py-3">Margin %</th>
                <th className="px-6 py-3">CBM (m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400">Generating report...</td></tr>
              ) : data.map((variant) => {
                const cost = Number(variant.cost_price) || 0;
                const sell = Number(variant.price_sell) || 0;
                const profit = sell - cost;
                const margin = sell > 0 ? (profit / sell) * 100 : 0;
                const cbm = calculateCBM(variant.length_cm, variant.width_cm, variant.height_cm);

                return (
                  <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{variant.products?.name || "Part"}</div>
                      <div className="text-xs text-slate-500 font-mono">{variant.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">RM {cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold text-right sm:text-left">RM {sell.toFixed(2)}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">RM {profit.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              "h-full transition-all",
                              margin > 20 ? "bg-green-500" : "bg-blue-500"
                            )} 
                            style={{ width: `${Math.min(margin, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{margin.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
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

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3">
         <Info size={20} className="text-blue-500" />
         <p className="text-xs text-blue-700 font-medium">
            Margins are calculated based on POS retail pricing. CBM uses the standard logistics formula: (L×W×H)/1,000,000.
         </p>
      </div>
    </div>
  );
}