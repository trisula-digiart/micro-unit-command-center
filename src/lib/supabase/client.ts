import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Singleton Supabase client instance for client-side queries,
 * realtime subscriptions, and authentication.
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

/**
 * Factory function for generating clean Supabase client instances.
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}