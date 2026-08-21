/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy client cache
let supabaseInstance: SupabaseClient | null = null;
let hasWarned = false;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Prevent initialization error if variables are not provided, are empty, or contain placeholder text
  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));
  if (!isValidUrl || !key || url.includes('placeholder') || key.includes('placeholder')) {
    if (!hasWarned) {
      console.warn(
        'Supabase configuration is missing or invalid. Please define valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets panel.'
      );
      hasWarned = true;
    }
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export interface SupabaseSyncPayload {
  id: string;
  email: string;
  settings: any;
  userStats: any;
  documents: any[];
  highlights: any[];
  annotations: any[];
  stickyNotes: any[];
  folders: any[];
  decks: any[];
  vocabulary: any[];
  lastSynced: number;
}

/**
 * Upload/Sync user progress payload directly to Supabase table `user_progress`
 */
export async function syncToSupabase(userId: string, payload: SupabaseSyncPayload): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    // Upsert the progress data. Table: 'user_progress', matching by 'id'
    const { error } = await client
      .from('user_progress')
      .upsert(
        {
          id: userId,
          email: payload.email,
          data: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Supabase upsert error:', error.message);
      // If table doesn't exist, we'll try a fallback log or explain to user
      if (error.code === '42P01') {
        console.warn(
          "Table 'user_progress' not found in Supabase. Please ensure you have run the schema query in your Supabase SQL editor: \n\n" +
          "create table user_progress (\n" +
          "  id text primary key,\n" +
          "  email text,\n" +
          "  data jsonb,\n" +
          "  updated_at timestamptz default now()\n" +
          ");"
        );
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed syncing to Supabase:', err);
    return false;
  }
}

/**
 * Fetch and download user progress payload from Supabase table `user_progress`
 */
export async function fetchFromSupabase(userId: string): Promise<SupabaseSyncPayload | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('user_progress')
      .select('data')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error.message);
      return null;
    }

    if (data && data.data) {
      return data.data as SupabaseSyncPayload;
    }
    return null;
  } catch (err) {
    console.error('Failed fetching from Supabase:', err);
    return null;
  }
}
