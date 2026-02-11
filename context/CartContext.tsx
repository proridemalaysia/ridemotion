"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState<any>(null);

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
  }, []);

  const fetchCart = async (userId: string) => {
    const { data } = await supabase
      .from('cart_items')
      .select(`*, product_variants (*, products(name))`)
      .eq('user_id', userId);
    
    if (data) {
      setCartItems(data);
      setCartCount(data.reduce((acc: number, item: any) => acc + item.quantity, 0));
    }
  };

  const addToCart = async (variantId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('variant_id', variantId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert([{ user_id: user.id, variant_id: variantId, quantity: 1 }]);
    }
    await fetchCart(user.id);
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', id);
      await fetchCart(user.id);
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, cartItems, addToCart, removeFromCart, fetchCart, user }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);