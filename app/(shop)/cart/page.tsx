"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Trash2, CreditCard, ArrowRight, Package } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function CartPage() {
  const { cartItems, cartCount, fetchCart, MOCK_USER_ID } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = cartItems.reduce((acc, item) => 
    acc + (item.product_variants.price_online * item.quantity), 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    // 1. Create the Sale record
    const { data: sale, error: sError } = await supabase
      .from('sales')
      .insert([{
        customer_id: MOCK_USER_ID,
        source: 'online',
        total_amount: total,
        status: 'pending',
        payment_status: 'paid'
      }])
      .select().single();

    if (sError) {
      alert(sError.message);
      setIsCheckingOut(false);
      return;
    }

    // 2. Create Sale Items (This triggers the stock deduction in SQL!)
    const saleItems = cartItems.map(item => ({
      sale_id: sale.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.product_variants.price_online,
      subtotal: item.product_variants.price_online * item.quantity
    }));

    await supabase.from('sale_items').insert(saleItems);

    // 3. Clear Cart
    await supabase.from('cart_items').delete().eq('user_id', MOCK_USER_ID);
    
    await fetchCart();
    setIsCheckingOut(false);
    alert("Order Placed Successfully! Stock has been deducted from ERP.");
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Package className="text-orange-600" /> Your Shopping Cart ({cartCount} items)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border flex gap-4 items-center">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <Package size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.product_variants.sku}</h3>
                <p className="text-orange-600 font-bold">RM {item.product_variants.price_online.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Qty: {item.quantity}</span>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {cartItems.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
              <p className="text-gray-400">Your cart is empty.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit sticky top-28">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 pb-4 border-b">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>RM {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
          </div>
          <div className="flex justify-between py-4 text-xl font-bold text-slate-900">
            <span>Total</span>
            <span>RM {total.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isCheckingOut}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isCheckingOut ? <Spinner size={20} /> : <CreditCard size={20} />}
            {isCheckingOut ? 'Processing...' : 'Place Order Now'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}