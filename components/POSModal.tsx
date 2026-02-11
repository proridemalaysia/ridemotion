"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Search, ShoppingCart, Trash2, CheckCircle, Package, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { Spinner } from './Spinner';
import { clsx } from 'clsx';

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function POSModal({ isOpen, onClose, onSuccess }: POSModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'tng' | 'card'>('cash');

  useEffect(() => {
    if (searchTerm.length > 1) {
      const delay = setTimeout(async () => {
        const { data } = await supabase
          .from('product_variants')
          .select(`*, products (name)`)
          .or(`sku.ilike.%${searchTerm}%,products(name.ilike.%${searchTerm}%)`)
          .limit(5);
        if (data) setResults(data);
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  const addToCart = (variant: any) => {
    const existing = cart.find(item => item.id === variant.id);
    if (existing) {
      setCart(cart.map(item => item.id === variant.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...variant, qty: 1 }]);
    }
    setSearchTerm("");
    setResults([]);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const total = cart.reduce((acc, item) => acc + (item.price_sell * item.qty), 0);
      
      const { data: sale, error: sErr } = await supabase.from('sales').insert([{
        source: 'walk-in',
        total_amount: total,
        status: 'completed',
        payment_status: 'paid',
        payment_method: paymentMethod
      }]).select().single();

      if (sErr) throw sErr;

      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        variant_id: item.id,
        quantity: item.qty,
        unit_price: item.price_sell,
        subtotal: item.price_sell * item.qty
      }));

      await supabase.from('sale_items').insert(saleItems);
      setCart([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <ShoppingCart size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800 italic uppercase">Counter POS</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Search */}
          <div className="w-7/12 p-8 border-r overflow-y-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search SKU or Part Name..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden divide-y">
                  {results.map(res => (
                    <div key={res.id} onClick={() => addToCart(res)} className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{res.products.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{res.sku}</p>
                      </div>
                      <p className="font-black text-blue-600 text-sm">RM {res.price_sell.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {cart.length === 0 && (
                 <div className="col-span-2 text-center py-20 text-slate-300">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">Scanning ready...</p>
                 </div>
               )}
            </div>
          </div>

          {/* Right Side: Cart & Payment */}
          <div className="w-5/12 bg-slate-50/50 p-8 flex flex-col">
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] mb-4">Cart Items</h3>
            <div className="flex-1 space-y-3 overflow-y-auto mb-6">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-xs truncate w-40">{item.products.name}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase">Qty: {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-800 text-sm">RM {(item.qty * item.price_sell).toFixed(2)}</p>
                    <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Select Payment Method</p>
               <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                      paymentMethod === 'cash' ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                    )}
                  >
                    <Banknote size={20} />
                    <span className="text-[10px] font-black uppercase">Cash</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('tng')}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                      paymentMethod === 'tng' ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                    )}
                  >
                    <Smartphone size={20} />
                    <span className="text-[10px] font-black uppercase">TNG</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                      paymentMethod === 'card' ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                    )}
                  >
                    <CreditCard size={20} />
                    <span className="text-[10px] font-black uppercase">Card</span>
                  </button>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end mb-6">
                <span className="font-black text-slate-400 uppercase text-xs">Total Amount</span>
                <span className="text-3xl font-black text-slate-900 italic">RM {cart.reduce((acc, i) => acc + (i.price_sell * i.qty), 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Spinner size={24} /> : <CheckCircle size={24}/>}
                {loading ? "PROCESSING..." : "FINALIZE SALE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}