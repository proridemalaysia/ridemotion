"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Trash2, CreditCard, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, DEV_USER_ID, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // FIXED: Explicitly typed 'acc' as number and 'item' as any to satisfy TypeScript
  const total = cartItems.reduce((acc: number, item: any) => 
    acc + (Number(item.product_variants?.price_online || 0) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      // 1. Create the Sale record
      const { data: sale, error: sError } = await supabase
        .from('sales')
        .insert([{
          customer_id: DEV_USER_ID,
          source: 'online',
          total_amount: total,
          status: 'pending',
          payment_status: 'paid',
          payment_method: 'fpx' // Default for online
        }])
        .select().single();

      if (sError) throw sError;

      // 2. Create Sale Items (This triggers the stock deduction in SQL!)
      const saleItems = cartItems.map((item: any) => ({
        sale_id: sale.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product_variants.price_online,
        subtotal: item.product_variants.price_online * item.quantity
      }));

      const { error: iError } = await supabase.from('sale_items').insert(saleItems);
      if (iError) throw iError;

      // 3. Clear Cart
      await supabase.from('cart_items').delete().eq('user_id', DEV_USER_ID);
      
      await fetchCart();
      alert("Order Placed Successfully! Inventory has been updated.");
      window.location.href = "/profile";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-3">
        <ShoppingCart className="text-orange-600" size={32} /> 
        SHOPPING CART <span className="text-slate-300 font-light">({cartCount})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-center group hover:border-orange-200 transition-all">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-orange-50 transition-colors">
                <Package size={40} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                  {item.product_variants?.products?.name || 'Automotive Part'}
                </h3>
                <p className="text-[10px] font-black text-blue-500 tracking-widest uppercase mb-3">
                  SKU: {item.product_variants?.sku}
                </p>
                <div className="flex items-center gap-4">
                   <p className="text-orange-600 font-black text-xl italic">RM {Number(item.product_variants?.price_online).toFixed(2)}</p>
                   <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500">Qty: {item.quantity}</span>
                </div>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
          
          {cartItems.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <Package size={64} className="mx-auto text-slate-100 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Your cart is empty</p>
              <button onClick={() => window.location.href = '/'} className="mt-4 text-orange-600 font-black text-xs hover:underline uppercase italic">Continue Shopping →</button>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-slate-200/50 h-fit sticky top-28">
          <h2 className="font-black text-slate-800 text-xl mb-6 uppercase italic tracking-tighter border-b pb-4">Summary</h2>
          
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
               <span className="font-black text-slate-400 uppercase text-[10px]">Grand Total</span>
               <span className="text-3xl font-black text-slate-900 italic underline decoration-orange-500 decoration-4">RM {total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 mb-8 border border-blue-100">
            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
            <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
              Inventory locked & synced. Secure SSL Checkout enabled.
            </p>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isCheckingOut}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-slate-200"
          >
            {isCheckingOut ? <Spinner size={24} /> : <CreditCard size={24} />}
            {isCheckingOut ? 'PROCESSING...' : 'CONFIRM PURCHASE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon for this page
const ShoppingCart = ({ size, className }: { size: number, className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);