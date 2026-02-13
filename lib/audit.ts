import { supabase } from './supabase';

export async function recordLog(action: string, entity: string, details: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from('admin_logs').insert([{
      user_id: user.id,
      action: action,
      entity: entity,
      details: details
    }]);
  }
}