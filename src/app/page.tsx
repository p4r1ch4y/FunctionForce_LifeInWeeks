import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import TimelineView from '@/components/timeline-view';

export default async function Home() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Your Life in Weeks</h1>
        <p className="mt-2 text-lg text-gray-600">
          Visualize your journey through time, enhanced with AI insights
        </p>
      </header>
      
      <TimelineView userId={session.user.id} />
    </div>
  );
} 