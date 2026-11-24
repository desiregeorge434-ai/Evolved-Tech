import type { SupabaseClient } from '@supabase/supabase-js'

export type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: string | null
  is_verified: boolean
  created_at: string
  limn_username: string | null // <--- Make sure this is here!
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, role, is_verified, created_at, limn_username')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[profile] getProfile failed:', error.message)
    return null
  }
  return data
}

export type ProfileUpdate = Partial<Pick<Profile, 'full_name' | 'username' | 'bio' | 'role' | 'limn_username'>>

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: ProfileUpdate
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
