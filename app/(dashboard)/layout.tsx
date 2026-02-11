"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3,
  LogOut,
  ChevronRight,
  Truck,
  Settings,
  CircleUser,
  Wallet,
  Users,
  Wrench,
  Printer // Added for Labels
} from 'lucide-react';
import { clsx } from 'clsx';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Print Labels', href: '/inventory/labels', icon: Printer }, // Added link
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Stock In (GRN)', href: '/purchasing', icon: Truck },
  { name: 'Sales / POS', href: '/sales', icon: ShoppingCart },
  { name: 'Finance (Z-Report)', href: '/finance', icon: Wallet },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Utilities', href: '/utilities', icon: Wrench },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation - Fixed Position */}
      <aside className="w-72 bg-slate-900 text-white fixed h-full shadow-2xl z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase">
              PARTS<span className="text-blue-500">ERP</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Management Suite</p>
        </div>
        
        <nav className="mt-4 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 py-0.5">
                  <item.icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-orange-400 transition-colors mb-2">
            <ShoppingCart size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Public Store</span>
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 w-full transition-colors font-bold text-xs uppercase tracking-widest">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 flex-1 p-10 print:ml-0 print:p-0">
        <header className="mb-10 flex justify-between items-center print:hidden">
          <div>
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-1">
              {pathname === '/admin' ? 'Operations' : pathname.replace('/', '').split('/').pop()?.replace('-', ' ')}
            </h2>
            <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time Notification Component */}
            <NotificationBell />
            
            <div className="w-px h-10 bg-slate-200 mx-2"></div>

            {/* Profile Section */}
            <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 shadow-lg shadow-slate-200">
                 <CircleUser size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 uppercase italic leading-none">Admin</p>
                <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest mt-1">System Live</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="print:block">
          {children}
        </div>
      </main>
    </div>
  );
}