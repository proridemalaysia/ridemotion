"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, CreditCard, ArrowRight, Package, 
  ShieldCheck, ShoppingCart, Tag, ArrowLeft, User, MapPin, Mail, Phone
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, user, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Guest Details State
  const [guestInfo, setGuestInfo] = useState({
    name: '', email: '', phone: '', address: ''
  });

  const totalAmount = cartItems.reduce((acc: number, item: any) => {
    const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
    const discount = Number(item.products_flat?.discount_percent || 0);
    const finalUnitPrice = basePrice * (1 - (discount / 100));
    return acc + (finalUnitPrice * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    // Validate for Guests
    if (!user) {
        if (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address) {
            alert("Please fill in your shipping details.");
            return;
        }
    }

    setIsCheckingOut(true);
    try {
      // 1. Create the Sale record
      const saleData = {
        customer_id: user ? user.id : null, // Store null for guests
        source: 'online',
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'paid',
        payment_method: 'fpx',
        // Attach guest info to order metadata or address column
        shipping_address: user ? user.address : `${guestInfo.name} | ${guestInfo.phone} | ${guestInfo.address}`,
        customer_phone: user ? user.phone : guestInfo.phone
      };

      const { data: sale, error: sError } = await supabase
        .from('sales')
        .insert([saleData])
        .select().single();

      if (sError) throw sError;

      // 2. Insert Sale Items
      const saleItems = cartItems.map((item: any) => {
        const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
        const finalUnitPrice = basePrice * (1 - (item.products_flat?.discount_percent || 0) / 100);
        return {
          sale_id: sale.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: finalUnitPrice,
          subtotal: finalUnitPrice * item.quantity
        };
      });

      await supabase.from('sale_items').insert(saleItems);
      
      // 3. Clear Cart
      await clearCart();
      
      alert("Order Placed Successfully!");
      window.location.href = user ? "/profile" : "/";
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 font-sans">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 uppercase italic">
            <ShoppingCart className="text-blue-600" size={32} /> Checkout
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Review your warehouse order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-8">
          {/* GUEST INFO FORM - Shown only if not logged in */}
          {!user && (
            <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-lg"><User size={20}/></div>
                  <h2 className="text-lg font-bold uppercase italic tracking-tighter">Guest Shipping Details</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Full Name" className="bg-white/10 border border-white/20 p-3 rounded-xl outline-none focus:bg-white/20 placeholder:text-blue-200 text-sm font-medium" onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
                  <input placeholder="Email Address" className="bg-white/10 border border-white/20 p-3 rounded-xl outline-none focus:bg-white/20 placeholder:text-blue-200 text-sm font-medium" onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} />
                  <input placeholder="Phone (+60...)" className="bg-white/10 border border-white/20 p-3 rounded-xl outline-none focus:bg-white/20 placeholder:text-blue-200 text-sm font-medium" onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                  <textarea placeholder="Complete Delivery Address" rows={2} className="md:col-span-2 bg-white/10 border border-white/20 p-3 rounded-xl outline-none focus:bg-white/20 placeholder:text-blue-200 text-sm font-medium" onChange={e => setGuestInfo({...guestInfo, address: e.target.value})} />
               </div>
               <p className="mt-4 text-[10px] text-blue-100 font-medium uppercase tracking-widest opacity-70">Optional: <Link href="/login" className="underline font-bold">Login</Link> to auto-fill these details and earn points.</p>
            </div>
          )}

          {/* ITEM LIST */}
          <div className="space-y-4">
            {cartItems.map((item: any) => (
                <div key={item.variant_id} className="bg-white p-6 rounded-3xl border border-slate-200 flex gap-6 items-center shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0">
                      <Package size={32} />
                   </div>
                   <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-sm uppercase italic">{item.products_flat?.name}</h3>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Item: {item.products_flat?.item_code}</p>
                      <div className="flex items-center gap-4 mt-3">
                         <span className="text-lg font-bold text-slate-900">RM {(item.products_flat?.price_online * (1 - (item.products_flat?.discount_percent / 100))).toFixed(2)}</span>
                         <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Qty: {item.quantity}</span>
                      </div>
                   </div>
                   <button onClick={() => removeFromCart(item.variant_id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xl h-fit sticky top-28">
            <h2 className="font-bold text-slate-900 text-lg mb-6 uppercase tracking-widest italic border-b border-slate-50 pb-4">Check-Out</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest"><span>Subtotal</span><span>RM {totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest"><span>Shipping</span><span className="text-green-600">FREE</span></div>
              <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                 <div className="flex flex-col"><span className="font-bold text-slate-400 uppercase text-[9px]">Grand Total</span><span className="text-3xl font-bold text-slate-900 italic tracking-tighter">RM {totalAmount.toFixed(2)}</span></div>
              </div>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={isCheckingOut || cartCount === 0}
              className="w-full bg-[#2563EB] text-white py-5 rounded-[24px] font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30"
            >
              {isCheckingOut ? <Spinner size={20}/> : "Complete Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}