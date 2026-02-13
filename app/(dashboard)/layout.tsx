"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, 
  Truck, Wallet, Users, FileText, ClipboardCheck, 
  Settings, UserCircle, CreditCard, Activity, LineChart 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

  const adminTools = [
    { name: 'Manage Users', href: '/users', icon: UserCircle },
    { name: 'Admin Logs', href: '/logs', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Exact Color Slate-950 */}
      <aside className="w-[260px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
        <div className="p-6 pt-8">
          <Link href="/admin">
            <h1 className="text-white text-2xl font-bold tracking-tight italic uppercase">MY ERP</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto scrollbar-hide">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  active ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-8 pb-3 px-3">
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Admin Tools</p>
          </div>

          {adminTools.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Session Profile */}
        <div className="p-4 border-t border-slate-900 bg-[#020617]">
          <div className="flex items-center gap-3 px-2 mb-6">
             <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-[10px] text-slate-500 uppercase font-medium">Admin</p>
             </div>
          </div>
          <button className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-red-400 hover:text-red-300 w-full transition-all group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-widest italic">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="ml-[260px] flex-1">
        {children}
      </main>
    </div>
  );
}