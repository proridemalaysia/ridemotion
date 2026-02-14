import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MemberProfileView from '@/components/MemberProfileView';

export const revalidate = 0;

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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: orders } = await supabase
    .from('sales')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <MemberProfileView 
      initialProfile={{
        ...profile,
        created_at: profile?.created_at || user.created_at 
      }} 
      initialOrders={orders || []} 
    />
  );
}