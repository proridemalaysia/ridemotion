"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, CreditCard, ArrowRight, Package, 
  ShieldCheck, ShoppingCart, Tag, ArrowLeft, User, MapPin, Phone
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, cartCount, user, isInitialized, removeFromCart, clearCart, fetchCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Real Profile for Logged-in users
  const [profile, setProfile] = useState<any>(null);

  // Guest Details State
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data));
    }
  }, [user]);

  const totalAmount = cartItems.reduce((acc: number, item: any) => {
    const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
    const discount = Number(item.products_flat?.discount_percent || 0);
    const finalUnitPrice = basePrice * (1 - (discount / 100));
    return acc + (finalUnitPrice * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    // Safety check for Guest
    if (!user && (!guestInfo.name || !guestInfo.phone || !guestInfo.address)) {
        alert("Please provide shipping details for guest checkout.");
        return;
    }

    setIsCheckingOut(true);
    try {
      const finalAddress = user ? (profile?.address || 'Pickup at Store') : `${guestInfo.name} | ${guestInfo.phone} | ${guestInfo.address}`;
      const finalPhone = user ? (profile?.phone || 'N/A') : guestInfo.phone;

      const { data: sale, error: sError } = await supabase.from('sales').insert([{
        customer_id: user ? user.id : null,
        source: 'online',
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'paid',
        payment_method: 'fpx',
        shipping_address: finalAddress,
        customer_phone: finalPhone
      }]).select().single();

      if (sError) throw sError;

      const saleItems = cartItems.map((item: any) => {
        const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
        const finalPrice = basePrice * (1 - (Number(item.products_flat?.discount_percent || 0) / 100));
        return {
          sale_id: sale.id,
          variant_id: item.variant_id || item.id,
          quantity: item.quantity,
          unit_price: finalPrice,
          subtotal: finalPrice * item.quantity
        };
      });

      await supabase.from('sale_items').insert(saleItems);
      await clearCart();
      
      alert("Order Successful!");
      window.location.href = user ? "/profile" : "/";
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isInitialized) return <div className="flex justify-center py-40"><Spinner size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-500 font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
          <ShoppingCart className="text-blue-600" size={32} />
          Your Cart <span className="text-slate-300 font-normal">({cartCount})</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. SHIPPING SECTION */}
          {user ? (
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200">
               <div className="flex items-center gap-3 mb-4 text-blue-600">
                  <MapPin size={20}/>
                  <h2 className="font-bold uppercase text-xs tracking-widest">Deliver to Profile Address</h2>
               </div>
               <p className="text-sm font-semibold text-slate-800 uppercase italic">Member: {profile?.full_name}</p>
               <p className="text-xs text-slate-500 mt-2 leading-relaxed">{profile?.address || "No address found. We will contact you for pickup."}</p>
               <Link href="/profile" className="text-[10px] font-bold text-blue-600 mt-4 block hover:underline">CHANGE ADDRESS →</Link>
            </div>
          ) : (
            <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <User size={20}/>
                  <h2 className="text-lg font-bold uppercase italic tracking-tighter">Guest Checkout Details</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Receiver Name" className="bg-white/10 p-3 rounded-xl border border-white/20 outline-none placeholder:text-blue-200 text-sm" onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
                  <input placeholder="Phone Number" className="bg-white/10 p-3 rounded-xl border border-white/20 outline-none placeholder:text-blue-200 text-sm" onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                  <textarea placeholder="Delivery Address" rows={2} className="md:col-span-2 bg-white/10 p-3 rounded-xl border border-white/20 outline-none placeholder:text-blue-200 text-sm" onChange={e => setGuestInfo({...guestInfo, address: e.target.value})} />
               </div>
            </div>
          )}

          {/* 2. ITEMS LIST */}
          <div className="space-y-4">
            {cartItems.map((item: any) => {
                const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
                const finalPrice = basePrice * (1 - (Number(item.products_flat?.discount_percent || 0) / 100));
                return (
                    <div key={item.variant_id} className="bg-white p-6 rounded-3xl border border-slate-200 flex gap-6 items-center shadow-sm hover:border-blue-400 transition-all">
                       <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0 border"><Package size={32} /></div>
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-800 text-sm uppercase italic leading-tight">{item.products_flat?.name}</h3>
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">CODE: {item.products_flat?.item_code}</p>
                          <div className="flex items-center gap-4 mt-3">
                             <span className="text-lg font-bold text-slate-900 font-mono">RM {finalPrice.toFixed(2)}</span>
                             <span className="px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">Qty: {item.quantity}</span>
                          </div>
                       </div>
                       <button onClick={() => removeFromCart(item.variant_id)} className="p-3 text-slate-300 hover:text-red-500 active:scale-95 transition-all"><Trash2 size={20}/></button>
                    </div>
                )
            })}
            {cartItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                <p className="font-bold uppercase tracking-widest text-xs italic">Your warehouse cart is empty</p>
                <Link href="/" className="text-blue-600 font-bold text-[10px] mt-4 block hover:underline">GO BACK TO CATALOG →</Link>
              </div>
            )}
          </div>
        </div>

        {/* 3. FINAL SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xl h-fit sticky top-28">
            <h2 className="font-bold text-slate-900 text-lg mb-6 uppercase tracking-widest italic border-b border-slate-50 pb-4 text-center">Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-500 font-bold text-[10px] uppercase tracking-widest"><span>Subtotal</span><span>RM {totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500 font-bold text-[10px] uppercase tracking-widest"><span>Logistics</span><span className="text-green-600">FREE</span></div>
              <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                 <div className="flex flex-col"><span className="font-bold text-slate-400 uppercase text-[9px]">Total Payable</span><span className="text-3xl font-bold text-slate-900 italic tracking-tighter">RM {totalAmount.toFixed(2)}</span></div>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={isCheckingOut || cartCount === 0}
              className="w-full bg-[#020617] text-white py-5 rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30"
            >
              {isCheckingOut ? <Spinner size={20}/> : "Complete Payment"}
            </button>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
               <ShieldCheck size={16} className="text-slate-400"/>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Secure Cloud Transaction Sync Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}