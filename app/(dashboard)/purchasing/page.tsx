"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Plus, Search, Calendar, PackageCheck, History } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import StockInModal from '@/components/StockInModal';

export default function PurchasingPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    const { data } = await supabase
      .from('purchases')
      .select(`
        *,
        purchase_items (
          id,
          quantity,
          cost_price,
          product_variants (sku, products (name))
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) setPurchases(data);
    setLoading(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Purchasing & GRN</h2>
          <p className="text-slate-400 text-sm font-medium">Record incoming stock from suppliers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-100 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          STOCK IN (NEW GRN)
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Truck size={28}/></div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Spend</p>
            <h3 className="text-2xl font-black text-slate-800">RM {purchases.reduce((acc, p) => acc + p.total_amount, 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><PackageCheck size={28}/></div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">GRN Recorded</p>
            <h3 className="text-2xl font-black text-slate-800">{purchases.length}</h3>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center gap-5">
           <div className="text-emerald-400"><History size={28}/></div>
           <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Inventory Sync</p>
            <h3 className="text-lg font-bold">Auto-Updating Enabled</h3>
           </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex items-center gap-2">
           <Search size={18} className="text-slate-400" />
           <input type="text" placeholder="Search by Supplier or Ref No..." className="bg-transparent border-none text-xs font-bold outline-none w-64" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Date Received</th>
                <th className="px-6 py-5">Supplier & Reference</th>
                <th className="px-6 py-5">Items / SKUs</th>
                <th className="px-6 py-5 text-right">Invoice Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">No records found. Click "Stock In" to add inventory.</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                       <Calendar size={14} className="text-blue-500"/>
                       {new Date(p.created_at).toLocaleDateString('en-MY')}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800 uppercase text-xs">{p.supplier_name}</div>
                    <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md w-fit mt-1 italic tracking-widest">
                      REF: {p.reference_no}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-slate-600 font-medium">
                      {p.purchase_items?.length} Items
                      <div className="text-[10px] text-slate-400 font-bold italic truncate w-40">
                        {p.purchase_items?.[0]?.product_variants?.sku || '---'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-800 italic">
                    RM {p.total_amount.toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Stock In (GRN) Modal */}
      <StockInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPurchases} 
      />
    </div>
  );
}