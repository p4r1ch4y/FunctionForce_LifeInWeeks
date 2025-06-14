import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createSampleEvents, userHasEvents } from '@/lib/sample-data';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = createClient();
    
    let session = null;
    try {
      const { data: { session: userSession } } = await supabase.auth.getSession();
      session = userSession;
    } catch (authError) {
      console.warn('Auth check failed:', authError);
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user already has events
    const hasEvents = await userHasEvents(supabase, userId);
    
    if (hasEvents) {
      return NextResponse.json(
        { 
          message: 'User already has events',
          seeded: false 
        },
        { status: 200 }
      );
    }

    // Create sample events
    const events = await createSampleEvents(supabase, userId);

    return NextResponse.json({
      message: 'Sample data created successfully',
      seeded: true,
      eventsCreated: events?.length || 0
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Failed to seed sample data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = createClient();
    
    let session = null;
    try {
      const { data: { session: userSession } } = await supabase.auth.getSession();
      session = userSession;
    } catch (authError) {
      console.warn('Auth check failed:', authError);
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user has events
    const hasEvents = await userHasEvents(supabase, userId);

    // Get event count
    const { data: events, error } = await supabase
      .from('personal_events')
      .select('id, sentiment')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    const eventCount = events?.length || 0;
    const sentimentBreakdown = events?.reduce((acc, event) => {
      const sentiment = event.sentiment as 'positive' | 'negative' | 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 }) || { positive: 0, negative: 0, neutral: 0 };

    return NextResponse.json({
      hasEvents,
      eventCount,
      sentimentBreakdown,
      canSeed: !hasEvents
    });

  } catch (error) {
    console.error('Error checking data status:', error);
    return NextResponse.json(
      { error: 'Failed to check data status' },
      { status: 500 }
    );
  }
}
