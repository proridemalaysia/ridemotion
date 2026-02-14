"use client";
import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { signOutAction } from '@/app/login/actions';

export default function ShopHeaderIcons({ user }: { user: any }) {
  const { cartCount } = useCart();

  return (
    <div className="flex items-center gap-6">
      <Link href="/cart" className="relative text-slate-700 hover:text-orange-600 transition-all active:scale-90">
        <ShoppingCart size={32} strokeWidth={2} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
            {cartCount}
          </span>
        )}
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-1 text-slate-700 hover:text-orange-600 transition-all">
            <User size={32} strokeWidth={2} />
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 active:scale-95 border-l border-slate-200 pl-4 h-8 outline-none">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      ) : (
        <Link href="/login" className="p-1 text-slate-700 hover:text-orange-600">
          <User size={32} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}