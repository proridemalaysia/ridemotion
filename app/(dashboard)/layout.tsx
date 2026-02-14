import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import SidebarContent from '@/components/SidebarContent'; // We will create this next
import NotificationBell from '@/components/NotificationBell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  );

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Get Profile directly on the server
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user?.id)
    .single();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Data is passed into a client component for active links */}
      <SidebarContent 
        user={user} 
        profile={profile} 
      />

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