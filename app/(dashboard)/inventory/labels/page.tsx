"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Printer, Search, Package, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';
import { clsx } from 'clsx';
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
    // Fetching variants with their parent product name
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        products (
          name
        )
      `);
    
    if (error) {
      console.error("Error fetching labels:", error);
    }
    
    if (data) {
      setItems(data);
    }
    setLoading(false);
  }

  // Filter items based on search term (Added optional chaining here to prevent filter crashes)
  const filteredItems = items.filter(i => {
    const searchLower = searchTerm.toLowerCase();
    const skuMatch = i.sku?.toLowerCase().includes(searchLower);
    const nameMatch = i.products?.name?.toLowerCase().includes(searchLower);
    return skuMatch || nameMatch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Search Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="p-2 hover:bg-white rounded-xl transition-all">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Label Station</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Generate warehouse bin & price tags</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="relative w-80">
              <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Filter by SKU or Part Name..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={() => window.print()}
             className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
           >
             <Printer size={20} /> PRINT LABELS
           </button>
        </div>
      </div>

      {/* Labels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4 print:p-0">
        {loading ? (
          <div className="col-span-full py-32 text-center">
            <Spinner size={40} className="mx-auto text-blue-600" />
            <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Initializing Label Engine...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
             <Tag size={48} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-400 font-bold uppercase text-xs">No products found for labeling</p>
          </div>
        ) : filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white border-2 border-slate-50 p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:border-blue-200 transition-colors print:border-slate-300 print:rounded-none print:shadow-none print:w-full"
          >
            {/* FIXED: Added Optional Chaining here */}
            <p className="text-[11px] font-black uppercase text-slate-800 leading-tight h-8 line-clamp-2">
               {item.products?.name || "UNSPECIFIED PART"}
            </p>
            
            {/* Barcode Render */}
            <div className="scale-90 md:scale-100 print:scale-110">
               <Barcode 
                 value={item.sku || "000000"} 
                 width={1.6} 
                 height={50} 
                 fontSize={12} 
                 background="#ffffff"
                 fontOptions="bold"
               />
            </div>

            {/* Label Footer */}
            <div className="w-full flex justify-between items-end px-2 pt-4 border-t border-slate-50">
               <div className="text-left">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Bin Location</p>
                  <div className="flex items-center gap-1.5 text-blue-600 font-black text-sm italic bg-blue-50 px-2 py-0.5 rounded-lg">
                    {item.bin_location || 'SEC-X'}
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Price RM</p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter">
                    {item.price_sell?.toFixed(2) || '0.00'}
                  </p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print Instructions - Hidden on Print */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4 print:hidden">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
           <Printer size={20} />
        </div>
        <div>
           <h4 className="font-black text-amber-900 uppercase text-xs mb-1">Print Calibration Tip</h4>
           <p className="text-xs text-amber-700 font-medium leading-relaxed">
             For best results with Dymo or Zebra label printers, set your print scale to <span className="font-bold underline">"Actual Size"</span> and orientation to <span className="font-bold underline">"Portrait"</span>. Ensure backgrounds are enabled in your browser print settings.
           </p>
        </div>
      </div>

    </div>
  );
}