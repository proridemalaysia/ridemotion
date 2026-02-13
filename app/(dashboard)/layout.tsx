"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, Truck, Activity, CreditCard, 
  Users, FileText, BarChart3, ClipboardCheck, UserCircle, 
  Settings, LogOut 
} from 'lucide-react';
import { clsx } from 'clsx';

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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Reference Style: Slate-950 */}
      <aside className="w-[260px] bg-[#0F172A] fixed h-full z-50 flex flex-col shadow-xl">
        <div className="p-6">
          <Link href="/admin">
            <h1 className="text-white text-xl font-bold tracking-tight">MY ERP</h1>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto pt-4">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {group.label && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
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
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all",
                        active ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon size={18} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Section */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">M</div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">muhamadnurizanfakir...</p>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">Admin</p>
             </div>
          </div>
          <button className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-red-400 hover:text-red-300 w-full transition-all">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}