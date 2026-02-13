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
  Truck, 
  Users, 
  FileText, 
  ClipboardCheck, 
  Settings, 
  UserCircle, 
  CreditCard, 
  Activity,
  LineChart // Replaced 'Analysis' with 'LineChart'
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Reference Style: Slate-950 */}
      <aside className="w-[260px] bg-[#0F172A] fixed h-full z-50 flex flex-col shadow-xl">
        <div className="p-6 mb-4">
          <h1 className="text-white text-2xl font-bold tracking-tight">MY ERP</h1>
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {group.label && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                      pathname === item.href 
                        ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/20" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-6">
             <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-[10px] text-slate-500">Admin</p>
             </div>
          </div>
          <button className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400 hover:text-red-400 w-full transition-all group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1">
        {/* Top bar for notifications and high-level info */}
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