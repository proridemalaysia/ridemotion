"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, MapPin, ArrowLeft, Printer, CheckSquare } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function PackingListPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  async function fetchSaleDetails() {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          id,
          quantity,
          product_variants (
            sku,
            bin_location,
            products (name)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (data) {
      // Sort items by Bin Location to optimize the "Picking Path"
      const sortedItems = data.sale_items.sort((a: any, b: any) => 
        (a.product_variants?.bin_location || '').localeCompare(b.product_variants?.bin_location || '')
      );
      setSale({ ...data, sale_items: sortedItems });
    }
    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-40"><Spinner size={40} /></div>;
  if (!sale) return <div className="p-20 text-center">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} /> BACK TO ORDERS
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <Printer size={20} /> PRINT PICKING LIST
        </button>
      </div>

      {/* Picking List Document */}
      <div className="bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-sm print:shadow-none print:border-slate-300 print:rounded-none">
        
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
           <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Warehouse <span className="text-blue-600">Pick-List</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Order Ref: #ORD-{sale.order_number}</p>
           </div>
           <div className="text-right">
              <div className="bg-slate-900 text-white px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-2">Internal Document</div>
              <p className="text-xs font-bold text-slate-500">{new Date().toLocaleString()}</p>
           </div>
        </div>

        {/* Customer / Order Summary */}
        <div className="grid grid-cols-2 gap-10 mb-10">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ship to:</p>
              <p className="text-sm font-black text-slate-800 uppercase italic underline decoration-blue-200 underline-offset-4">{sale.source === 'online' ? 'Online Customer' : 'Walk-in Collection'}</p>
              <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">{sale.shipping_address || 'Counter Pickup'}</p>
           </div>
           <div className="text-right flex flex-col justify-center">
              <p className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{sale.sale_items.reduce((acc: any, item: any) => acc + item.quantity, 0)} Items</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To be picked & packed</p>
           </div>
        </div>

        {/* Picking Table */}
        <table className="w-full text-left">
           <thead>
              <tr className="border-b-2 border-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <th className="py-4 px-2 bg-blue-50 text-blue-600">Bin Location</th>
                 <th className="py-4 px-2">Part Description / SKU</th>
                 <th className="py-4 px-2 text-center">Qty</th>
                 <th className="py-4 px-2 text-right">Picked?</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {sale.sale_items.map((item: any) => (
                <tr key={item.id} className="group">
                  <td className="py-6 px-2 align-top">
                     <div className="flex items-center gap-2 bg-blue-600 text-white w-fit px-3 py-1.5 rounded-lg font-black text-sm italic shadow-lg shadow-blue-100">
                        <MapPin size={14} />
                        {item.product_variants?.bin_location || 'SEC-X'}
                     </div>
                  </td>
                  <td className="py-6 px-2 align-top">
                     <p className="text-sm font-black text-slate-800 uppercase leading-tight max-w-xs">{item.product_variants?.products?.name || 'Unknown Part'}</p>
                     <code className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">SKU: {item.product_variants?.sku}</code>
                  </td>
                  <td className="py-6 px-2 text-center align-top">
                     <span className="text-3xl font-black text-slate-900 italic">x{item.quantity}</span>
                  </td>
                  <td className="py-6 px-2 text-right align-top">
                     <div className="inline-block w-8 h-8 border-4 border-slate-200 rounded-lg group-hover:border-blue-200"></div>
                  </td>
                </tr>
              ))}
           </tbody>
        </table>

        {/* Picker Verification */}
        <div className="mt-20 flex justify-between items-end border-t-2 border-dashed border-slate-200 pt-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-5 h-5 border-2 border-slate-900 rounded"></div>
                 <p className="text-[10px] font-bold text-slate-800 uppercase">Items verified & undamaged</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-5 h-5 border-2 border-slate-900 rounded"></div>
                 <p className="text-[10px] font-bold text-slate-800 uppercase">Weight & Packaging Checked</p>
              </div>
           </div>
           <div className="text-center w-64">
              <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Warehouse Picker Signature</p>
           </div>
        </div>
      </div>
    </div>
  );
}