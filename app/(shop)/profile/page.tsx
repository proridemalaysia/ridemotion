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

  // 1. Authenticate user on server
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // 3. Fetch full profile including TIN and BRN
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 4. Fetch order history
  const { data: orders } = await supabase
    .from('sales')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  // 5. Render the client UI component
  return (
    <MemberProfileView 
      initialProfile={profile} 
      initialOrders={orders || []} 
    />
  );
}