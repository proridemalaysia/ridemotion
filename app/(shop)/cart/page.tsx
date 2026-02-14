"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, 
  CreditCard, 
  ArrowRight, 
  Package, 
  ShieldCheck, 
  ShoppingCart,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, user, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculation Engine: Calculates total based on price_online and individual discounts
  const totalAmount = cartItems.reduce((acc: number, item: any) => {
    const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
    const discount = Number(item.products_flat?.discount_percent || 0);
    const finalUnitPrice = basePrice * (1 - (discount / 100));
    return acc + (finalUnitPrice * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (!user) return window.location.href = '/login';
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      // 1. Create the Sale record in the 'sales' table
      const { data: sale, error: sError } = await supabase
        .from('sales')
        .insert([{
          customer_id: user.id,
          source: 'online',
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'paid',
          payment_method: 'fpx'
        }])
        .select()
        .single();

      if (sError) throw sError;

      // 2. Prepare items for the 'sale_items' table
      const saleItems = cartItems.map((item: any) => {
        const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
        const discount = Number(item.products_flat?.discount_percent || 0);
        const finalUnitPrice = basePrice * (1 - (discount / 100));
        
        return {
          sale_id: sale.id,
          variant_id: item.variant_id, // Links to products_flat ID
          quantity: item.quantity,
          unit_price: finalUnitPrice,
          subtotal: finalUnitPrice * item.quantity
        };
      });

      // 3. Insert Sale Items (Triggers automatic stock deduction in database)
      const { error: iError } = await supabase.from('sale_items').insert(saleItems);
      if (iError) throw iError;

      // 4. Clear the shopping cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      
      // 5. Refresh local cart state and redirect
      await fetchCart(user.id);
      alert("Order successful! Your parts are being prepared for shipping.");
      window.location.href = "/profile";
      
    } catch (err: any) {
      alert("Checkout Error: " + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 uppercase italic">
            <ShoppingCart className="text-blue-600" size={32} />
            My Shopping Cart
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Warehouse Reservation: {cartCount} items
          </p>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline active:scale-95 transition-all"
        >
          <ArrowLeft size={16} /> Continue Browsing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: LIST OF ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-20 text-center">
              <Package size={64} className="mx-auto text-slate-100 mb-6" />
              <h3 className="text-lg font-bold text-slate-400 uppercase italic">Your cart is empty</h3>
              <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                Shop Now
              </Link>
            </div>
          ) : (
            cartItems.map((item: any) => {
              const basePrice = Number(item.products_flat?.price_online || item.products_flat?.price_myr || 0);
              const discount = Number(item.products_flat?.discount_percent || 0);
              const finalPrice = basePrice * (1 - (discount / 100));

              return (
                <div key={item.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center group transition-all hover:border-blue-300">
                  {/* Part Visual */}
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 overflow-hidden shrink-0">
                    {item.products_flat?.image_url ? (
                      <img src={item.products_flat.image_url} className="w-full h-full object-cover" alt="part" />
                    ) : (
                      <Package size={32} />
                    )}
                  </div>
                  
                  {/* Part Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-slate-800 text-base uppercase leading-tight">
                      {item.products_flat?.name || 'Automotive Part'}
                    </h3>
                    <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-widest italic">
                      Item Code: {item.products_flat?.item_code || item.products_flat?.part_number}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                       <div className="flex flex-col">
                          <p className="text-slate-900 font-bold text-lg italic">RM {finalPrice.toFixed(2)}</p>
                          {discount > 0 && (
                            <span className="text-[10px] text-slate-300 line-through font-medium">RM {basePrice.toFixed(2)}</span>
                          )}
                       </div>
                       <div className="h-6 w-px bg-slate-100"></div>
                       <span className="text-xs bg-slate-50 px-3 py-1 rounded-full font-bold text-slate-500 uppercase">
                        Qty: {item.quantity}
                       </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    title="Remove from cart"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl h-fit sticky top-28">
            <h2 className="font-bold text-slate-900 text-lg mb-6 uppercase tracking-widest italic border-b border-slate-50 pb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-500 font-bold text-[11px] uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-mono">RM {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold text-[11px] uppercase tracking-widest">
                <span>Shipping Fee</span>
                <span className="text-green-600">FREE</span>
              </div>
              
              <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                 <div className="flex flex-col">
                    <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Total Payable</span>
                    <span className="text-3xl font-bold text-slate-900 tracking-tighter italic">
                      RM {totalAmount.toFixed(2)}
                    </span>
                 </div>
                 {totalAmount > 0 && (
                   <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg uppercase italic">
                      <Tag size={12}/> Best Price
                   </div>
                 )}
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 mb-8 border border-blue-100">
              <ShieldCheck className="text-blue-600 shrink-0" size={20} />
              <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
                Live Inventory Locked. Your parts are reserved for 15 minutes.
              </p>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isCheckingOut}
              className="w-full bg-[#020617] text-white py-5 rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.97] transition-all disabled:opacity-30 uppercase tracking-[0.2em] shadow-2xl shadow-slate-200"
            >
              {isCheckingOut ? (
                <div className="flex items-center gap-2">
                  <Spinner size={18} />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Finalize Order</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Customer Help Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
             <h4 className="text-[11px] font-bold text-slate-800 uppercase mb-2">Need Assistance?</h4>
             <p className="text-xs text-slate-500 leading-relaxed font-medium">
               Call our technical support at <b>+60 3-1234 5678</b> for vehicle compatibility verification.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}