/**
 * Client-side auth functions — safe to import in Client Components.
 * Uses the browser Supabase client only.
 */
import { createClient } from './supabase'

export async function signUpWholesale(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInWholesale(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOutWholesale() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
