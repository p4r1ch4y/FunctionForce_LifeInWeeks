import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const createClient = () => {
  let cookieStore;

  try {
    cookieStore = cookies();
  } catch (error) {
    // Handle cases where cookies() is called outside of a request context
    console.warn('Cookies not available in this context:', error);
    cookieStore = null;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (!cookieStore) return undefined;
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.warn('Error getting cookie:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          if (!cookieStore) return;
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn('Error setting cookie:', error);
          }
        },
        remove(name: string, options: any) {
          if (!cookieStore) return;
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Error removing cookie:', error);
          }
        },
      },
    }
  );
};