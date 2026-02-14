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

// Define Navigation Structure
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      // 1. Get Auth Session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsReady(true);
        return;
      }

      // 2. Initial fallback from Auth Metadata (Immediate)
      const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
      setProfile({
        name: fallbackName,
        role: 'staff', // Temporary default
        initial: fallbackName.charAt(0).toUpperCase()
      });

      // 3. Fetch Real Role from Database
      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (dbProfile) {
        console.log("Verified System Access:", dbProfile.role);
        setProfile({
          name: dbProfile.full_name || fallbackName,
          role: dbProfile.role.toLowerCase(), // Force lowercase for comparison
          initial: (dbProfile.full_name || fallbackName).charAt(0).toUpperCase()
        });
      } else {
        console.error("Database Profile Missing for ID:", user.id);
      }
      
      setIsReady(true);
    }

    loadUserData();
  }, []);

  // Strict check for admin role
  const isUserAdmin = profile?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR CONTAINER */}
      <aside className="w-[260px] bg-[#020617] fixed h-full z-50 flex flex-col shadow-2xl">
        
        {/* LOGO SECTION */}
        <div className="p-6 pt-8">
          <Link href="/admin" className="block active:scale-95 transition-transform">
            <h1 className="text-white text-xl font-bold tracking-tight uppercase">MY ERP</h1>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise System</p>
          </Link>
        </div>
        
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pt-4">
          <div>
            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 active:scale-95",
                      active 
                        ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ADMIN TOOLS GROUP (CONDITIONAL RENDERING) */}
          {isUserAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 active:scale-95",
                        active 
                          ? "bg-[#2563EB] text-white shadow-lg shadow-blue-900/40" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* BOTTOM USER PANEL */}
        <div className="p-4 border-t border-slate-900 bg-[#020617]">
          {!isReady ? (
            <div className="flex items-center gap-3 px-2 py-4 animate-pulse">
               <div className="w-9 h-9 rounded-lg bg-slate-800"></div>
               <div className="space-y-2">
                 <div className="w-24 h-2 bg-slate-800 rounded"></div>
                 <div className="w-16 h-2 bg-slate-800 rounded"></div>
               </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2 mb-4 overflow-hidden">
                {/* Avatar color logic */}
                <div className={clsx(
                  "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg",
                  isUserAdmin ? "bg-red-600 shadow-red-900/20" : "bg-[#2563EB] shadow-blue-900/20"
                )}>
                    {profile?.initial || 'U'}
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight leading-none mb-1">
                        {profile?.name}
                    </p>
                    <p className={clsx(
                        "text-[9px] font-black uppercase tracking-widest",
                        isUserAdmin ? "text-red-400" : "text-blue-400"
                    )}>
                        {profile?.role}
                    </p>
                </div>
              </div>
              
              <form action={signOutAction} className="w-full">
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-slate-400 hover:text-red-400 w-full transition-all active:scale-95 group"
                >
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="uppercase tracking-widest font-bold">Sign Out</span>
                </button>
              </form>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WINDOW */}
      <main className="ml-[260px] flex-1 min-h-screen">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-end px-10 sticky top-0 z-40">
           <NotificationBell />
        </div>
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}