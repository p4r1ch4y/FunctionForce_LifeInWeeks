import { createClient } from '@/lib/supabase';
import LandingPage from '@/components/landing-page';
import Dashboard from '@/components/dashboard';

export default async function Home() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard userId={session.user.id} />;
}