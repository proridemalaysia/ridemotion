"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Search, Truck, Save, Package } from 'lucide-react';
import { Spinner } from './Spinner';

export default function StockInModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  
  // Modal Form State
  const [supplier, setSupplier] = useState("");
  const [refNo, setRefNo] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState(0);

  // Search Logic
  useEffect(() => {
    if (searchTerm.length > 1) {
      const delay = setTimeout(async () => {
        const { data } = await supabase
          .from('product_variants')
          .select(`*, products(name)`)
          .ilike('sku', `%${searchTerm}%`)
          .limit(5);
        if (data) setResults(data);
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return alert("Select a product first");
    setLoading(true);

    try {
      const total = qty * cost;
      // 1. Create Purchase
      const { data: purchase, error: pErr } = await supabase.from('purchases').insert([{
        supplier_name: supplier,
        reference_no: refNo,
        total_amount: total,
        status: 'received'
      }]).select().single();

      if (pErr) throw pErr;

      // 2. Create Purchase Item (Deduction trigger runs automatically)
      const { error: iErr } = await supabase.from('purchase_items').insert([{
        purchase_id: purchase.id,
        variant_id: selectedVariant.id,
        quantity: qty,
        cost_price: cost,
        subtotal: total
      }]);

      if (iErr) throw iErr;

      onSuccess();
      onClose();
      // Reset form
      setSupplier(""); setRefNo(""); setSelectedVariant(null);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
           <div className="flex items-center gap-3">
             <div className="bg-emerald-600 p-2 rounded-xl text-white"><Truck size={24}/></div>
             <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Record New GRN</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Supplier Name *</label>
              <input required className="w-full p-3 border rounded-xl bg-gray-50" placeholder="e.g. Bosch Parts MY" onChange={e => setSupplier(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference / Invoice #</label>
              <input required className="w-full p-3 border rounded-xl bg-gray-50" placeholder="e.g. INV-99001" onChange={e => setRefNo(e.target.value)} />
            </div>
          </div>

          <div className="relative">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Search SKU to Stock-In</label>
             <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                <input 
                  type="text" 
                  className="w-full pl-10 p-3 border rounded-xl bg-blue-50/50 border-blue-100" 
                  placeholder="Type SKU..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>

             {results.length > 0 && (
               <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 border border-slate-100 z-10 overflow-hidden divide-y">
                 {results.map(res => (
                   <div 
                    key={res.id} 
                    className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                    onClick={() => { setSelectedVariant(res); setResults([]); setSearchTerm(""); }}
                   >
                     <div>
                       <p className="font-bold text-sm">{res.products.name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase">{res.sku}</p>
                     </div>
                     <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Select Item</span>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {selectedVariant && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-800 uppercase italic">Selected: {selectedVariant.sku}</p>
                <p className="text-[10px] text-emerald-600">{selectedVariant.products.name}</p>
              </div>
              <button type="button" onClick={() => setSelectedVariant(null)} className="text-emerald-400 hover:text-red-500"><X size={16}/></button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity Received</label>
                <input type="number" required className="w-full p-3 border rounded-xl font-bold" min="1" onChange={e => setQty(parseInt(e.target.value))} />
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Cost (RM)</label>
                <input type="number" step="0.01" required className="w-full p-3 border rounded-xl font-bold" placeholder="0.00" onChange={e => setCost(parseFloat(e.target.value))} />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedVariant}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Spinner /> : <Save size={20}/>}
            {loading ? "RECORDING..." : "COMMIT TO INVENTORY"}
          </button>
        </form>
      </div>
    </div>
  );
}