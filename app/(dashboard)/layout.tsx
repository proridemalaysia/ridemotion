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
  Wallet,
  Users,
  Wrench,
  Printer,
  CircleUser
} from 'lucide-react';
import { clsx } from 'clsx';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Label Printing', href: '/inventory/labels', icon: Printer },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Stock In (GRN)', href: '/purchasing', icon: Truck },
  { name: 'Sales & POS', href: '/sales', icon: ShoppingCart },
  { name: 'Daily Closing', href: '/finance', icon: Wallet },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/utilities', icon: Wrench },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-50">
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded text-white">
              <Package size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">
              PartsHub ERP
            </span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
                )}
              >
                <item.icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-blue-600">
            <ShoppingCart size={18} />
            View Storefront
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-red-600 mt-1">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-sm font-semibold text-slate-600">
            {navItems.find(i => i.href === pathname)?.name || 'Admin'}
          </h2>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900">Administrator</p>
                <p className="text-[10px] text-green-600 font-medium">System Online</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-slate-400 border border-gray-200">
                 <CircleUser size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}