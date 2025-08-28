import { supabase } from '../lib/supabaseClient'

export interface UserNotification {
  id: string
  user_id: string
  title: string
  message: string
  payload?: any
  created_at: string
}

export async function fetchMyNotifications(userId: string): Promise<UserNotification[]> {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    console.warn('fetchMyNotifications error:', error.message)
    return []
  }
  return (data as UserNotification[]) || []
}

export function subscribeMyNotifications(userId: string, onChange: () => void) {
  const channel = supabase
    .channel(`user-${userId}-notifications`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${userId}` }, () => onChange())
    .subscribe()
  return () => supabase.removeChannel(channel)
}


