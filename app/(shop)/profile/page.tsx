import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MemberProfileView from '@/components/MemberProfileView';

export default async function ProfilePage() {
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

  // 1. Get the current user session on the server
  const { data: { user } } = await supabase.auth.getUser();

  // 2. If no user is logged in, send them to login page immediately
  if (!user) {
    redirect('/login');
  }

  // 3. Fetch real profile data (Nurizan, Karim, or Sofia)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 4. Fetch real order history
  const { data: orders } = await supabase
    .from('sales')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  // 5. Pass data to the UI Component
  return (
    <MemberProfileView 
      initialProfile={profile} 
      initialOrders={orders || []} 
    />
  );
}