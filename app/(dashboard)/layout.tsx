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
      { name: 'Analysis Order', href: '/analysis', icon: LineChart },
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
      <aside className="w-[260px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
        <div className="p-6 pt-8">
          <Link href="/admin">
            <h1 className="text-white text-xl font-bold tracking-tight uppercase">MY ERP</h1>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto pt-4 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {group.label && (
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 px-3">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200",
                        active 
                          ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40 font-semibold" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Section */}
        <div className="p-4 border-t border-slate-900 bg-[#020617]">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-[10px] text-slate-500 uppercase font-medium tracking-tighter">Admin</p>
             </div>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-red-400 hover:text-red-300 w-full transition-all group"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 min-h-screen flex flex-col">
        {/* Top Utility Bar */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-40">
           <NotificationBell />
        </div>
        
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}