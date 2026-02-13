"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Printer, Search, ArrowLeft, Tag, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';
// @ts-ignore
import Barcode from 'react-barcode';

export default function BarcodeLabelsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVariants();
  }, []);

  async function fetchVariants() {
    setLoading(true);
    const { data } = await supabase.from('product_variants').select(`*, products(name)`);
    if (data) setItems(data);
    setLoading(false);
  }

  const filtered = items.filter(i => 
    i.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="p-2 hover:bg-white rounded border border-slate-200 transition-all active:scale-95">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 uppercase italic">Label Station</h2>
        </div>

        <div className="flex gap-3">
           <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filter for Printing..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={() => window.print()}
             className="bg-[#2563EB] text-white px-5 py-2 rounded-md text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
           >
             <Printer size={16} strokeWidth={2.5} /> PRINT QUEUE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Spinner /></div>
        ) : filtered.map((item) => (
          <div key={item.id} className="bg-white border-2 border-slate-100 p-5 rounded-xl flex flex-col items-center justify-center space-y-3 print:border-slate-400 print:rounded-none">
            <p className="text-[10px] font-bold text-slate-800 text-center line-clamp-1 uppercase tracking-tighter w-full border-b border-slate-50 pb-2">
               {item.products?.name || "Spare Part"}
            </p>
            
            <div className="py-2 scale-90">
               <Barcode value={item.sku || "000"} width={1.3} height={40} fontSize={10} fontOptions="bold" />
            </div>

            <div className="w-full flex justify-between items-center pt-2">
               <div className="text-left">
                  <span className="text-[8px] font-bold text-slate-300 block uppercase tracking-widest">Bin</span>
                  <div className="flex items-center gap-1 text-blue-600 font-bold text-sm italic">
                    <MapPin size={10} /> {item.bin_location || 'SEC-X'}
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-[8px] font-bold text-slate-300 block uppercase tracking-widest">Price</span>
                  <span className="font-bold text-slate-900 text-sm">RM {Number(item.price_sell).toFixed(2)}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}