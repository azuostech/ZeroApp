'use client';

import { createBrowserClient } from '@supabase/ssr';
import { assertPublicEnv, publicEnv } from '@/src/lib/env';

let browserClient;

export function getBrowserSupabase() {
  if (browserClient) return browserClient;
  assertPublicEnv();
  browserClient = createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  return browserClient;
}
