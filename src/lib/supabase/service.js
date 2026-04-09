import { createClient } from '@supabase/supabase-js';
import { assertPublicEnv, getServiceRoleKey, publicEnv } from '@/src/lib/env';

let serviceClient;

export function getServiceSupabase() {
  if (serviceClient) return serviceClient;
  assertPublicEnv();
  serviceClient = createClient(publicEnv.supabaseUrl, getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return serviceClient;
}
