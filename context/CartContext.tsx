"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState<number>(0);
  // FIXED: Explicitly typed as <any[]> to prevent the 'never[]' build error
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [user, setUser] = useState<any>(null);

  const fetchCart = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`*, product_variants (*, products(name))`)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Cart fetch error:", error);
      return;
    }

    if (data) {
      setCartItems(data);
      // Explicitly typing the reduce function to satisfy strict build checks
      const count = data.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    }
  }, []);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchCart(session.user.id);
      }
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchCart(session.user.id);
      } else {
        setUser(null);
        setCartItems([]);
        setCartCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCart]);

  const addToCart = async (variantId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('variant_id', variantId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert([{ user_id: user.id, variant_id: variantId, quantity: 1 }]);
      }
      await fetchCart(user.id);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', id);
      await fetchCart(user.id);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      cartItems, 
      addToCart, 
      removeFromCart, 
      fetchCart, 
      user 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);