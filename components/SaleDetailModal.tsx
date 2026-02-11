"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { X, Printer, CheckCircle, Truck, MapPin, Hash, CreditCard, Banknote, Smartphone, ClipboardList, Send, Building2 } from 'lucide-react';
import { Spinner } from './Spinner';

export default function SaleDetailModal({ sale, isOpen, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [bizInfo, setBizInfo] = useState<any>(null);
  const [trackingNo, setTrackingNo] = useState(sale?.tracking_number || "");
  const [courier, setCourier] = useState(sale?.courier_name || "J&T Express");

  useEffect(() => {
    if (isOpen) {
      supabase.from('global_settings').select('*').eq('id', 'current_config').single().then(({ data }) => setBizInfo(data));
      setTrackingNo(sale?.tracking_number || "");
    }
  }, [isOpen, sale]);

  if (!isOpen || !sale) return null;

  const handleFulfill = async () => {
    setLoading(true);
    await supabase.from('sales').update({ 
      status: 'completed', tracking_number: trackingNo, courier_name: courier 
    }).eq('id', sale.id);
    onRefresh();
    onClose();
    setLoading(false);
  };

  const getPaymentIcon = () => {
    switch(sale.payment_method) {
      case 'cash': return <Banknote size={14} />;
      case 'tng': return <Smartphone size={14} />;
      default: return <CreditCard size={14} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 print:shadow-none print:rounded-none print:max-w-none print:h-screen">
        
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white"><Hash size={20} /></div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Invoice Viewer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto print:overflow-visible print:p-0">
          {/* INVOICE HEADER (The Professional Part) */}
          <div className="flex justify-between items-start mb-10 border-b-4 border-slate-900 pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">{bizInfo?.company_name || 'PARTSHUB ERP'}</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-xs leading-relaxed">{bizInfo?.company_address}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase">Tel: {bizInfo?.company_phone}</p>
              <p className="text-[10px] font-black text-slate-800">TAX ID: {bizInfo?.tax_id}</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black uppercase italic text-slate-300">INVOICE</h2>
              <p className="text-sm font-bold text-slate-800">#ORD-{sale.order_number}</p>
              <p className="text-xs font-bold text-slate-400">{new Date(sale.created_at).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill To:</h3>
              <p className="text-sm font-black text-slate-800 uppercase italic underline decoration-blue-200 decoration-4">{sale.source === 'walk-in' ? 'Counter Sale' : 'Online Order'}</p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{sale.shipping_address || 'Walk-in Collection'}</p>
            </div>
            <div className="text-right space-y-2">
               <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Status:</h3>
               <div className="flex items-center justify-end gap-2 text-green-600 font-black uppercase text-xs italic">
                  <CheckCircle size={14}/> Paid via {sale.payment_method}
               </div>
            </div>
          </div>

          <table className="w-full text-left mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-2">Item Description</th>
                <th className="py-4 px-2 text-center">Qty</th>
                <th className="py-4 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.sale_items?.map((item: any) => (
                <tr key={item.id} className="text-sm font-bold text-slate-800">
                  <td className="py-5 px-2">
                    <p className="uppercase">{item.product_variants?.sku}</p>
                    <p className="text-[9px] text-slate-400 tracking-tighter">Automotive Replacement Part</p>
                  </td>
                  <td className="py-5 px-2 text-center font-black italic text-lg">x{item.quantity}</td>
                  <td className="py-5 px-2 text-right font-black italic">RM {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6 border-t-2 border-slate-900">
            <div className="w-64 space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>RM {sale.total_amount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-2xl font-black text-slate-900 pt-4 italic">
                  <span>TOTAL</span>
                  <span className="underline decoration-blue-600 decoration-4">RM {sale.total_amount.toFixed(2)}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex flex-wrap gap-2 justify-between items-center print:hidden">
          <div className="flex gap-2">
            {sale.status === 'pending' && (
              <button onClick={handleFulfill} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-blue-200">
                <Send size={16} /> Fulfill & Ship
              </button>
            )}
            <Link href={`/sales/packing-list/${sale.id}`} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 uppercase tracking-widest shadow-lg"><ClipboardList size={16} /> Packing List</Link>
            <button onClick={() => window.print()} className="bg-white border-2 border-slate-900 text-slate-900 px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 uppercase tracking-widest"><Printer size={16} /> Print Invoice</button>
          </div>
          <button onClick={onClose} className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Close</button>
        </div>
      </div>
    </div>
  );
}