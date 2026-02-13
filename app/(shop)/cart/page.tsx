"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Trash2, CreditCard, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, user, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Updated to use products_flat prices
  const total = cartItems.reduce((acc: number, item: any) => 
    acc + (Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0) * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) return window.location.href = '/login';
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      const { data: sale, error: sError } = await supabase
        .from('sales')
        .insert([{
          customer_id: user.id,
          source: 'online',
          total_amount: total,
          status: 'pending',
          payment_status: 'paid',
          payment_method: 'fpx'
        }])
        .select().single();

      if (sError) throw sError;

      const saleItems = cartItems.map((item: any) => ({
        sale_id: sale.id,
        variant_id: item.variant_id, // This is the ID from products_flat
        quantity: item.quantity,
        unit_price: item.products_flat.price_online || item.products_flat.price_myr,
        subtotal: (item.products_flat.price_online || item.products_flat.price_myr) * item.quantity
      }));

      await supabase.from('sale_items').insert(saleItems);
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      
      await fetchCart(user.id);
      alert("Purchase Successful! Order is being processed.");
      window.location.href = "/profile";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3 uppercase italic">
        Shopping Cart <span className="text-slate-400 font-normal">({cartCount})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: any) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex gap-6 items-center shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                 <Package size={32} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm uppercase leading-tight">
                  {item.products_flat?.name}
                </h3>
                <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-widest">SKU: {item.products_flat?.part_number}</p>
                <div className="flex items-center gap-4 mt-3">
                   <p className="text-orange-600 font-bold text-lg italic">RM {Number(item.products_flat?.price_online || item.products_flat?.price_myr).toFixed(2)}</p>
                   <span className="text-[11px] bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 uppercase">Qty: {item.quantity}</span>
                </div>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-3 text-slate-300 hover:text-red-500 transition-all active:scale-90"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          {cartItems.length === 0 && (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-300">
              <Package size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs italic">Your warehouse cart is empty</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl h-fit sticky top-28">
          <h2 className="font-bold text-slate-800 text-lg mb-6 uppercase tracking-widest italic border-b pb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
              <span>Subtotal</span>
              <span>RM {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
              <span>Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-end">
               <span className="font-bold text-slate-400 uppercase text-[10px]">Total Payable</span>
               <span className="text-3xl font-bold text-slate-900 italic">RM {total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isCheckingOut}
            className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 uppercase tracking-widest"
          >
            {isCheckingOut ? <Spinner size={20} /> : <CreditCard size={20} />}
            {isCheckingOut ? 'Processing...' : 'Finalize Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}