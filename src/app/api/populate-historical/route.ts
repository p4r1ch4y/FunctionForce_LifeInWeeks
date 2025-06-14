import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { populateHistoricalEvents, getHistoricalEventsCount } from '@/lib/populate-historical-events';

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

    // Populate historical events
    const result = await populateHistoricalEvents();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error populating historical events:', error);
    return NextResponse.json(
      { error: 'Failed to populate historical events' },
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

    // Get historical events count
    const count = await getHistoricalEventsCount();

    return NextResponse.json({
      count,
      hasEvents: count > 0,
      message: count > 0 ? `${count} historical events in database` : 'No historical events found'
    });

  } catch (error) {
    console.error('Error checking historical events:', error);
    return NextResponse.json(
      { error: 'Failed to check historical events' },
      { status: 500 }
    );
  }
}
