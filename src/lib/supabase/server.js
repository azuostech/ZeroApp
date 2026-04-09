import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { assertPublicEnv, publicEnv } from '@/src/lib/env';

export async function createServerSupabase() {
  assertPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (_) {
          // Ignora em contextos onde cookies são somente leitura.
        }
      }
    }
  });
}
