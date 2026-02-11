"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, 
  Truck, Wallet, Users, Wrench, Printer, FileText, ClipboardCheck, 
  Settings, UserCircle, LogIn
} from 'lucide-react';
import { clsx } from 'clsx';
import NotificationBell from '@/components/NotificationBell';

const mainNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Purchasing', href: '/purchasing', icon: Truck },
  { name: 'Sales', href: '/sales', icon: ShoppingCart },
  { name: 'Payments', href: '/finance', icon: Wallet },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Analysis Order', href: '/analysis', icon: BarChart3 },
  { name: 'Reports (LHDN)', href: '/reports', icon: ClipboardCheck },
];

const adminTools = [
  { name: 'Manage Users', href: '/users', icon: UserCircle },
  { name: 'Admin Logs', href: '/logs', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Sidebar - Reference: Slate-950 Dark */}
      <aside className="w-[240px] bg-[#0f172a] text-slate-300 fixed h-full z-50 flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="block">
            <h1 className="text-xl font-bold text-white tracking-tight">MY ERP</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded text-[13px] transition-all",
                pathname === item.href ? "bg-slate-800 text-white shadow-sm" : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <item.icon size={18} className={pathname === item.href ? "text-blue-400" : "text-slate-400"} />
              {item.name}
            </Link>
          ))}

          <div className="pt-6 pb-2 px-3">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Tools</p>
          </div>

          {adminTools.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-[13px] hover:bg-slate-800/50 hover:text-white transition-all"
            >
              <item.icon size={18} className="text-slate-400" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-[10px] text-slate-500">Admin</p>
             </div>
          </div>
          <button className="flex items-center gap-2 px-2 py-2 text-[11px] text-red-400 hover:text-red-300 w-full transition-all">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[240px] flex-1 min-h-screen flex flex-col">
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}