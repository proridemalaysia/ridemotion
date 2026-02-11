"use client";
import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Search, User, PhoneCall, HelpCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. Top Utility Nav */}
      <div className="bg-slate-900 text-white py-1.5 px-4 text-[11px] font-bold">
        <div className="max-w-7xl mx-auto flex justify-between items-center uppercase tracking-[0.1em]">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5"><PhoneCall size={12} className="text-orange-500"/> Customer Care</span>
            <span className="flex items-center gap-1.5"><HelpCircle size={12} className="text-orange-500"/> FAQ</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-orange-400 transition-colors">Seller Centre</Link>
            <Link href="/profile" className="hover:text-orange-400 transition-colors">Order Tracking</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-600 p-2 rounded-xl text-white shadow-lg shadow-orange-100 group-hover:rotate-12 transition-transform">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800 italic uppercase">
              PARTS<span className="text-orange-600">HUB</span>
            </span>
          </Link>

          {/* Search Engine */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex bg-gray-100 rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-orange-500 focus-within:bg-white transition-all shadow-inner">
              <input 
                type="text" 
                placeholder="Search by part number, car model or category..." 
                className="w-full px-6 py-3 bg-transparent outline-none text-sm font-medium" 
              />
              <button className="bg-orange-600 text-white px-10 font-bold hover:bg-orange-700 transition-colors uppercase text-xs tracking-widest">Search</button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative text-slate-700 hover:text-orange-600 transition-all active:scale-90">
              <ShoppingCart size={32} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="p-2 text-slate-700 hover:text-orange-600 transition-all">
              <User size={32} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Main Dynamic Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* 4. Professional Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
             <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-lg mb-4">PARTSHUB</h4>
             <p className="text-xs text-slate-400 leading-relaxed">Malaysia's leading automotive spare parts ERP and e-commerce hybrid solution. Trusted by thousands of workshops nationwide.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6">Explore</h4>
            <ul className="text-sm font-bold text-slate-600 space-y-3">
              <li><Link href="/" className="hover:text-orange-600">All Categories</Link></li>
              <li><Link href="/profile" className="hover:text-orange-600">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6">Payment</h4>
            <div className="flex flex-wrap gap-2">
              <div className="bg-gray-50 border p-2 rounded font-black text-[9px] text-gray-400">FPX</div>
              <div className="bg-gray-50 border p-2 rounded font-black text-[9px] text-gray-400">TNG</div>
              <div className="bg-gray-50 border p-2 rounded font-black text-[9px] text-gray-400">VISA</div>
            </div>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6">Office</h4>
            <p className="text-xs font-bold text-slate-600">40000 Shah Alam, Selangor</p>
            <p className="text-xs text-slate-400 mt-2 italic font-medium">© 2024 PARTSHUB SYSTEM v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}