"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, 
  Truck, Wallet, Users, FileText, ClipboardCheck, 
  Settings, UserCircle, CreditCard, Activity, LineChart 
} from 'lucide-react';
import { clsx } from 'clsx';

const mainNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Purchasing', href: '/purchasing', icon: Truck },
  { name: 'Sales', href: '/sales', icon: Activity },
  { name: 'Payments', href: '/finance', icon: CreditCard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Analysis Order', href: '/analysis', icon: LineChart },
  { name: 'Reports (LHDN)', href: '/reports', icon: ClipboardCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Reference: Slate-950 */}
      <aside className="w-[260px] bg-[#0F172A] fixed h-full z-50 flex flex-col shadow-2xl">
        <div className="p-6">
          <h1 className="text-white text-xl font-bold tracking-tight">MY ERP</h1>
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-4">
          {mainNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                pathname === item.href ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-[10px] text-slate-500 font-medium">Admin</p>
             </div>
          </div>
          <button className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-red-400 hover:text-red-300 w-full transition-all">
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}