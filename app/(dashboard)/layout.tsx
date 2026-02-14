"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, 
  Truck, Users, FileText, ClipboardCheck, Settings, 
  UserCircle, CreditCard, Activity, LineChart, 
  Wrench, Printer, History
} from 'lucide-react';
import { clsx } from 'clsx';
import NotificationBell from '@/components/NotificationBell';
import { signOutAction } from '@/app/login/actions';
import { supabase } from '@/lib/supabase';

const menuGroups = [
  {
    items: [
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
    ]
  },
  {
    label: "Admin Tools",
    items: [
      { name: 'Manage Users', href: '/users', icon: UserCircle },
      { name: 'Admin Logs', href: '/logs', icon: History },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    role: string;
    initial: string;
  } | null>(null);

  useEffect(() => {
    async function loadIdentity() {
      // 1. Get the Auth user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const emailName = user.email?.split('@')[0] || "User";
        
        // 2. Fetch from 'profiles' table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          console.log("Current Profile Loaded:", profile);
          setUserProfile({
            fullName: profile.full_name || emailName,
            role: profile.role.toLowerCase().trim(),
            initial: (profile.full_name || emailName).charAt(0).toUpperCase()
          });
        } else {
          console.error("No database row found for user:", user.id);
          // Fallback if no profile row
          setUserProfile({ fullName: emailName, role: 'staff', initial: emailName.charAt(0).toUpperCase() });
        }
      }
    }
    loadIdentity();
  }, []);

  const isUserAdmin = userProfile?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
        <div className="p-6 pt-8">
          <Link href="/admin">
            <h1 className="text-white text-xl font-bold tracking-tight uppercase">MY ERP</h1>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pt-4">
          <div>
            <div className="space-y-0.5">
              {menuGroups[0].items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all",
                      active ? "bg-[#2563EB] text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Tools - Visible if role is exactly admin */}
          {isUserAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 px-3">
                Admin Tools
              </p>
              <div className="space-y-0.5">
                {menuGroups[1].items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all",
                        active ? "bg-[#2563EB] text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
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

        {/* BOTTOM PROFILE PANEL */}
        <div className="p-4 border-t border-slate-900 bg-[#020617]">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className={clsx(
               "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg",
               isUserAdmin ? "bg-red-600" : "bg-[#2563EB]"
             )}>
                {userProfile?.initial || '?'}
             </div>
             
             <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate uppercase">
                    {userProfile?.fullName || "Syncing..."}
                </p>
                <p className={clsx(
                    "text-[9px] font-black uppercase tracking-widest",
                    isUserAdmin ? "text-red-400" : "text-blue-400"
                )}>
                    {userProfile?.role || "Auth"}
                </p>
             </div>
          </div>
          
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-slate-400 hover:text-red-400 w-full transition-all group">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="uppercase tracking-widest">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

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