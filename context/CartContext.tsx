"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- 1. FETCH LOGIC ---
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

  // --- 2. THE MIGRATOR (Guest -> Member) ---
  const migrateCart = useCallback(async (userId: string) => {
    const localData = localStorage.getItem('guest_cart');
    if (!localData) return;

    const items = JSON.parse(localData);
    if (items.length > 0) {
      for (const item of items) {
        // Insert into DB
        await supabase.from('cart_items').upsert({
          user_id: userId,
          variant_id: item.variant_id,
          quantity: item.quantity
        }, { onConflict: 'user_id, variant_id' });
      }
      // Wipe Guest memory
      localStorage.removeItem('guest_cart');
    }
    fetchCart(userId);
  }, [fetchCart]);

  // --- 3. SESSION SYNC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        migrateCart(currentUser.id);
      } else {
        fetchCart(null);
      }
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) migrateCart(currentUser.id);
      else fetchCart(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchCart, migrateCart]);

  // --- 4. ACTIONS ---
  const addToCart = async (variantId: string, productData?: any) => {
    if (user) {
      await supabase.from('cart_items').upsert({
        user_id: user.id,
        variant_id: variantId,
        quantity: 1
      }, { onConflict: 'user_id, variant_id' });
      await fetchCart(user.id);
    } else {
      const localData = localStorage.getItem('guest_cart');
      let items = localData ? JSON.parse(localData) : [];
      const existingIdx = items.findIndex((i: any) => i.variant_id === variantId);
      if (existingIdx > -1) items[existingIdx].quantity += 1;
      else items.push({ variant_id: variantId, quantity: 1, products_flat: productData });
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
  };

  return (
    <CartContext.Provider value={{ 
      cartCount, cartItems, addToCart, removeFromCart, fetchCart, clearCart, user, isInitialized 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);