import { createClient } from '@/lib/supabase';
import LandingPage from '@/components/landing-page';
import Dashboard from '@/components/dashboard';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();

  let session = null;
  try {
    const { data: { session: userSession } } = await supabase.auth.getSession();
    session = userSession;
  } catch (error) {
    console.warn('Auth check failed:', error);
  }

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard userId={session.user.id} />;
}