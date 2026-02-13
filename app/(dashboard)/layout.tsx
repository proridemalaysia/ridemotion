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
import NotificationBell from '@/components/NotificationBell';

const menuGroups = [
  {
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Inventory', href: '/inventory', icon: Package },
      { name: 'Purchasing', href: '/purchasing', icon: Truck },
      { name: 'Sales', href: '/sales', icon: Activity },
      { name: 'Payments', href: '/finance', icon: CreditCard },
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Analysis Order', href: '/analysis', icon: BarChart3 },
      { name: 'Reports (LHDN)', href: '/reports', icon: ClipboardCheck },
    ]
  },
  {
    label: "Admin Tools",
    items: [
      { name: 'Manage Users', href: '/users', icon: UserCircle },
      { name: 'Admin Logs', href: '/logs', icon: Settings },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100">
      {/* Sidebar - Exact match to Slate-950 Reference */}
      <aside className="w-[280px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
        <div className="p-8 pt-10">
          <Link href="/admin">
            <h1 className="text-white text-2xl font-bold tracking-tight uppercase">MY ERP</h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-5 space-y-10 overflow-y-auto pt-6 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {group.label && (
                <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-4 px-3">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                        active 
                          ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40 font-bold" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                      )}
                    >
                      <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Section */}
        <div className="p-6 border-t border-slate-900 bg-[#020617]">
          <div className="flex items-center gap-4 px-2 mb-6">
             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 border border-slate-700">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Admin</p>
             </div>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-3 px-3 py-3 text-xs font-bold text-red-400 hover:text-red-300 w-full transition-all group uppercase tracking-widest"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[280px] flex-1 min-h-screen flex flex-col">
        {/* Top Utility Bar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-10 sticky top-0 z-40">
           <NotificationBell />
        </div>
        
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}