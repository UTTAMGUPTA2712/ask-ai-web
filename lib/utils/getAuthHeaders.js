import { supabase } from '@/lib/supabase/client';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAuthHeaders(retries = 3, interval = 500) {
  let session = null;

  for (let i = 0; i < retries; i++) {
    const { data } = await supabase.auth.getSession();
    session = data.session;

    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
    }

    // If no session, wait before retrying (unless it's the last attempt)
    if (i < retries - 1) {
      await delay(interval);
    }
  }

  // Return guest headers if all retries failed
  return {
    'Content-Type': 'application/json',
  };
}
