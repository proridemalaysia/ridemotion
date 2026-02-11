"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Printer, Search, ArrowLeft, Tag } from 'lucide-react';
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
    const { data } = await supabase
      .from('product_variants')
      .select(`*, products (name)`);
    if (data) setItems(data);
    setLoading(false);
  }

  const filteredItems = items.filter(i => {
    const searchLower = searchTerm.toLowerCase();
    return i.sku?.toLowerCase().includes(searchLower) || i.products?.name?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="p-2 hover:bg-white rounded border border-gray-200 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Label Printing</h2>
            <p className="text-slate-500 text-sm">Generate SKU barcodes for warehouse bins</p>
          </div>
        </div>

        <div className="flex gap-3">
           <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Filter by SKU or Name..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={() => window.print()}
             className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2"
           >
             <Printer size={16} /> Print All
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400"><Spinner size={32} className="mx-auto" /></div>
        ) : filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 p-4 rounded flex flex-col items-center justify-center space-y-3 print:border-gray-300 print:rounded-none">
            <p className="text-[11px] font-semibold text-slate-800 text-center line-clamp-1 uppercase">
               {item.products?.name || "Spare Part"}
            </p>
            
            <div className="scale-90">
               <Barcode value={item.sku || "000"} width={1.2} height={40} fontSize={10} />
            </div>

            <div className="w-full flex justify-between items-center pt-2 border-t border-gray-100">
               <div className="text-left text-[10px]">
                  <span className="text-gray-400 block uppercase">Bin</span>
                  <span className="font-bold text-blue-600">{item.bin_location || '---'}</span>
               </div>
               <div className="text-right text-[10px]">
                  <span className="text-gray-400 block uppercase">Price</span>
                  <span className="font-bold text-slate-900">RM {item.price_sell?.toFixed(2)}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}