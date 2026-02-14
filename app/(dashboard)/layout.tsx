"use client";
import React, { useEffect, useState } from 'react';
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
  LineChart,
  Wrench,
  Printer,
  History
} from 'lucide-react';
import { clsx } from 'clsx';
import NotificationBell from '@/components/NotificationBell';
import { signOutAction } from '@/app/login/actions';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the real user profile on load
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

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

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Exact match to Slate-950 Reference */}
      <aside className="w-[260px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
        <div className="p-6">
          <Link href="/admin">
            <h1 className="text-white text-xl font-bold tracking-tight uppercase">MY ERP</h1>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pt-4">
          {/* Main Navigation Group */}
          <div>
            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all",
                      active ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Tools Group - ONLY VISIBLE TO ADMINS */}
          {profile?.role === 'admin' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 px-3">
                Admin Tools
              </p>
              <div className="space-y-0.5">
                {adminTools.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all",
                        active ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon size={18} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom User Section - Real Data Integrated */}
        <div className="p-4 border-t border-slate-900 bg-[#020617]">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-9 h-9 rounded bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {profile?.full_name?.charAt(0) || 'U'}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate uppercase">
                    {profile?.full_name || 'Loading...'}
                </p>
                <p className={clsx(
                    "text-[9px] font-bold uppercase tracking-wider",
                    profile?.role === 'admin' ? "text-red-400" : "text-blue-400"
                )}>
                    {profile?.role || 'User'}
                </p>
             </div>
          </div>
          
          <form action={signOutAction} className="w-full">
            <button 
              type="submit"
              className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-slate-400 hover:text-red-400 w-full transition-all active:scale-95 group"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="uppercase tracking-widest">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 min-h-screen">
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