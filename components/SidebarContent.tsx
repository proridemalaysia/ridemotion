"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, 
  Truck, Users, FileText, ClipboardCheck, Settings, 
  UserCircle, CreditCard, Activity, LineChart, Wrench, Printer, History
} from 'lucide-react';
import { clsx } from 'clsx';
import { signOutAction } from '@/app/login/actions';

export default function SidebarContent({ user, profile }: { user: any, profile: any }) {
  const pathname = usePathname();

  const mainNav = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Label Station', href: '/inventory/labels', icon: Printer },
    { name: 'Purchasing', href: '/purchasing', icon: Truck },
    { name: 'Sales', href: '/sales', icon: Activity },
    { name: 'Payments', href: '/finance', icon: CreditCard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Analysis Order', href: '/analysis', icon: LineChart },
    { name: 'Reports (LHDN)', href: '/reports-lhdn', icon: ClipboardCheck },
    { name: 'Utilities', href: '/utilities', icon: Wrench },
  ];

  const adminTools = [
    { name: 'Manage Users', href: '/users', icon: UserCircle },
    { name: 'Admin Logs', href: '/logs', icon: History },
  ];

  const isUserAdmin = profile?.role?.toLowerCase() === 'admin';
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-[260px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
      <div className="p-6 pt-8">
        <Link href="/admin">
          <h1 className="text-white text-xl font-bold tracking-tight uppercase">MY ERP</h1>
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pt-4">
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all",
                pathname === item.href ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800"
              )}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {isUserAdmin && (
          <div className="animate-in fade-in">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 px-3">Admin Tools</p>
            <div className="space-y-0.5">
              {adminTools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all",
                    pathname === item.href ? "bg-[#2563EB] text-white shadow-lg" : "text-slate-400 hover:bg-slate-800"
                  )}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-900 bg-[#020617]">
        <div className="flex items-center gap-3 px-2 mb-4">
           <div className={clsx(
             "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0",
             isUserAdmin ? "bg-red-600" : "bg-blue-600"
           )}>
              {initial}
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate uppercase">{displayName}</p>
              <p className={clsx("text-[9px] font-black uppercase tracking-widest", isUserAdmin ? "text-red-400" : "text-blue-400")}>
                {profile?.role || 'Staff'}
              </p>
           </div>
        </div>
        
        <form action={signOutAction} className="w-full">
          <button type="submit" className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-slate-400 hover:text-red-400 w-full transition-all group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-widest font-bold">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}