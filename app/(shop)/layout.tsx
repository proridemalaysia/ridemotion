import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ShoppingCart, Package, Search, User, PhoneCall, HelpCircle, LogOut } from 'lucide-react';
import { signOutAction } from '@/app/login/actions';
import ShopHeaderIcons from '@/components/ShopHeaderIcons'; // We'll create this next

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
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

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-slate-900 text-white py-1.5 px-4 text-[11px] font-bold uppercase tracking-widest">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5"><PhoneCall size={12} className="text-orange-500"/> Support</span>
            <span className="flex items-center gap-1.5"><HelpCircle size={12} className="text-orange-500"/> FAQ</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-orange-400">Seller Centre</Link>
            <Link href="/profile" className="hover:text-orange-400">Track Order</Link>
          </div>
        </div>
      </div>

      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-600 p-2 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tighter italic uppercase text-slate-800">PARTSHUB</span>
          </Link>

          <div className="flex-1 max-w-2xl relative">
            <div className="flex bg-gray-100 rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-orange-500 focus-within:bg-white transition-all shadow-inner">
              <input type="text" placeholder="Search for car parts..." className="w-full px-6 py-3 bg-transparent outline-none text-sm font-medium" />
              <button className="bg-orange-600 text-white px-8 font-bold hover:bg-orange-700 transition-colors uppercase text-xs">Search</button>
            </div>
          </div>

          {/* Interaction Icons (Client side for cart count) */}
          <ShopHeaderIcons user={user} />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">{children}</main>

      <footer className="bg-white border-t py-12 mt-auto text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">
         © 2024 PARTSHUB ERP SYSTEM v1.0.4
      </footer>
    </div>
  );
}