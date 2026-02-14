"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, CreditCard, ArrowRight, Package, 
  ShieldCheck, ShoppingCart, Tag, ArrowLeft, User
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, user, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '', address: '' });

  const totalAmount = cartItems.reduce((acc: number, item: any) => {
    const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
    const finalUnitPrice = basePrice * (1 - (Number(item.products_flat?.discount_percent || 0) / 100));
    return acc + (finalUnitPrice * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!user && (!guestInfo.name || !guestInfo.phone || !guestInfo.address)) {
        alert("Please provide shipping details.");
        return;
    }

    setIsCheckingOut(true);
    try {
      const saleData = {
        customer_id: user ? user.id : null,
        source: 'online',
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'paid',
        payment_method: 'fpx',
        shipping_address: user ? (user.address || 'Member Address') : `${guestInfo.name} | ${guestInfo.phone} | ${guestInfo.address}`,
        customer_phone: user ? user.phone : guestInfo.phone
      };

      const { data: sale, error: sError } = await supabase.from('sales').insert([saleData]).select().single();
      if (sError) throw sError;

      const saleItems = cartItems.map((item: any) => ({
        sale_id: sale.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0) * (1 - (Number(item.products_flat?.discount_percent || 0) / 100)),
        subtotal: (Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0) * (1 - (Number(item.products_flat?.discount_percent || 0) / 100))) * item.quantity
      }));

      await supabase.from('sale_items').insert(saleItems);
      await clearCart();
      alert("Order Placed!");
      window.location.href = user ? "/profile" : "/";
    } catch (err: any) { alert(err.message); } 
    finally { setIsCheckingOut(false); }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 uppercase italic mb-10">
        <ShoppingCart className="text-blue-600" size={32} /> Checkout ({cartCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {!user && (
            <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl animate-in slide-in-from-top-4">
               <h2 className="text-lg font-bold uppercase italic mb-6">Guest Shipping Details</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Name" className="bg-white/10 p-3 rounded-xl border border-white/20 outline-none focus:bg-white/20" onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
                  <input placeholder="Phone" className="bg-white/10 p-3 rounded-xl border border-white/20 outline-none focus:bg-white/20" onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                  <textarea placeholder="Address" rows={2} className="md:col-span-2 bg-white/10 p-3 rounded-xl border border-white/20 outline-none focus:bg-white/20" onChange={e => setGuestInfo({...guestInfo, address: e.target.value})} />
               </div>
            </div>
          )}

          <div className="space-y-4">
            {cartItems.map((item: any) => (
                <div key={item.variant_id} className="bg-white p-6 rounded-3xl border border-slate-200 flex gap-6 items-center shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0"><Package size={32} /></div>
                   <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-sm uppercase italic">{item.products_flat?.name}</h3>
                      <div className="flex items-center gap-4 mt-3">
                         <span className="text-lg font-bold text-slate-900">RM {(Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0) * (1 - (Number(item.products_flat?.discount_percent || 0) / 100))).toFixed(2)}</span>
                         <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Qty: {item.quantity}</span>
                      </div>
                   </div>
                   <button onClick={() => removeFromCart(item.variant_id)} className="p-3 text-slate-300 hover:text-red-500 active:scale-90 transition-all"><Trash2 size={20}/></button>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xl h-fit sticky top-28">
          <div className="flex justify-between items-end mb-8 border-b pb-4">
             <span className="font-bold text-slate-400 uppercase text-[9px]">Grand Total</span>
             <span className="text-3xl font-bold text-slate-900 italic tracking-tighter">RM {totalAmount.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} disabled={isCheckingOut || cartCount === 0} className="w-full bg-[#2563EB] text-white py-5 rounded-[20px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-xl disabled:opacity-30">
            {isCheckingOut ? <Spinner size={20}/> : "Complete Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}