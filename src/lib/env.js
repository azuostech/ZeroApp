const missing = (key) => {
  throw new Error(`Variavel de ambiente ausente: ${key}`);
};

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

export function assertPublicEnv() {
  if (!publicEnv.supabaseUrl) missing('NEXT_PUBLIC_SUPABASE_URL');
  if (!publicEnv.supabaseAnonKey) missing('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) missing('SUPABASE_SERVICE_ROLE_KEY');
  return key;
}
