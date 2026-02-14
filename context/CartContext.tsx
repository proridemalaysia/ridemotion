"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchCart = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`*, products_flat (*)`)
      .eq('user_id', userId);
    
    if (error) return;

    if (data) {
      setCartItems(data);
      const count = data.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchCart(session.user.id);
      }
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchCart(session.user.id);
      } else {
        setUser(null);
        setCartItems([]);
        setCartCount(0);
      }
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [fetchCart]);

  const addToCart = async (variantId: string) => {
    // 1. Check for user session
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return { success: false, error: 'auth_required' };
    }

    try {
      // 2. Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('variant_id', variantId)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert([{ 
            user_id: currentUser.id, 
            variant_id: variantId, 
            quantity: 1 
        }]);
      }
      
      await fetchCart(currentUser.id);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'db_error' };
    }
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', id);
      await fetchCart(user.id);
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, cartItems, addToCart, removeFromCart, fetchCart, user, isInitialized }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);