"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Trash2, CreditCard, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, user, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = cartItems.reduce((acc: number, item: any) => 
    acc + (Number(item.product_variants?.price_online || 0) * item.quantity), 0);

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
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product_variants.price_online,
        subtotal: item.product_variants.price_online * item.quantity
      }));

      await supabase.from('sale_items').insert(saleItems);
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      
      await fetchCart(user.id);
      alert("Order successful! You can track it in your profile.");
      window.location.href = "/profile";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        Shopping Cart <span className="text-gray-400 font-normal">({cartCount})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 flex gap-5 items-center group shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-gray-300">
                {item.product_variants?.products?.image_url ? (
                  <img src={item.product_variants.products.image_url} className="w-full h-full object-cover rounded" />
                ) : (
                  <Package size={24} />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                  {item.product_variants?.products?.name}
                </h3>
                <p className="text-[10px] text-blue-600 font-mono mt-1">SKU: {item.product_variants?.sku}</p>
                <div className="flex items-center gap-4 mt-2">
                   <p className="text-orange-600 font-bold">RM {Number(item.product_variants?.price_online).toFixed(2)}</p>
                   <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Qty: {item.quantity}</span>
                </div>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {cartItems.length === 0 && (
            <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 text-sm font-medium">Your cart is empty</p>
              <button onClick={() => window.location.href = '/'} className="mt-4 text-orange-600 text-xs font-bold hover:underline">Continue Shopping</button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit sticky top-28">
          <h2 className="font-bold text-gray-800 text-base mb-4 border-b pb-3">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>RM {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
               <span className="font-bold text-gray-800">Total Amount</span>
               <span className="text-xl font-bold text-orange-600">RM {total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded text-[11px] text-blue-700 flex gap-2 mb-6">
            <ShieldCheck size={16} className="shrink-0" />
            Stock is reserved for 30 minutes after checkout.
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isCheckingOut}
            className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            {isCheckingOut ? <Spinner size={18} /> : <CreditCard size={18} />}
            {isCheckingOut ? 'Processing...' : 'Checkout Now'}
          </button>
        </div>
      </div>
    </div>
  );
}