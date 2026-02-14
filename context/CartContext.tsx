"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchCart = useCallback(async (userId: string | null) => {
    if (userId) {
      const { data } = await supabase
        .from('cart_items')
        .select(`*, products_flat (*)`)
        .eq('user_id', userId);
      
      if (data) {
        setCartItems(data);
        setCartCount(data.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0));
      }
    } else {
      const localData = localStorage.getItem('guest_cart');
      const items = localData ? JSON.parse(localData) : [];
      setCartItems(items);
      setCartCount(items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchCart(session?.user?.id ?? null);
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchCart(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [fetchCart]);

  const addToCart = async (variantId: string, productData?: any) => {
    if (user) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('variant_id', variantId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert([{ user_id: user.id, variant_id: variantId, quantity: 1 }]);
      }
      await fetchCart(user.id);
    } else {
      const localData = localStorage.getItem('guest_cart');
      let items = localData ? JSON.parse(localData) : [];
      const existingIdx = items.findIndex((i: any) => i.variant_id === variantId);
      if (existingIdx > -1) {
        items[existingIdx].quantity += 1;
      } else {
        items.push({
          variant_id: variantId,
          quantity: 1,
          products_flat: productData
        });
      }
      localStorage.setItem('guest_cart', JSON.stringify(items));
      fetchCart(null);
    }
    return { success: true };
  };

  const removeFromCart = async (variantId: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('variant_id', variantId).eq('user_id', user.id);
      fetchCart(user.id);
    } else {
      const localData = localStorage.getItem('guest_cart');
      if (localData) {
        const items = JSON.parse(localData).filter((i: any) => i.variant_id !== variantId);
        localStorage.setItem('guest_cart', JSON.stringify(items));
        fetchCart(null);
      }
    }
  };

  const clearCart = async () => {
    if (user) await supabase.from('cart_items').delete().eq('user_id', user.id);
    localStorage.removeItem('guest_cart');
    setCartItems([]);
    setCartCount(0);
  }

  return (
    <CartContext.Provider value={{ 
      cartCount, cartItems, addToCart, removeFromCart, fetchCart, clearCart, user, isInitialized 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);