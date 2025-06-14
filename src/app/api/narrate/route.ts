import { NextRequest, NextResponse } from 'next/server';
import { generateNarrative } from '@/lib/ai';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { personalEventText, historicalEventText, weekDate, eventId } = await request.json();

    if (!personalEventText) {
      return NextResponse.json(
        { error: 'personalEventText is required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let narrative = '';
    let historicalContext = '';

    // If historical event is provided, generate narrative
    if (historicalEventText) {
      narrative = await generateNarrative(personalEventText, historicalEventText);
      historicalContext = historicalEventText;
    } else if (weekDate) {
      // Fetch historical events for that week
      const weekStart = new Date(weekDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Get historical events from our API
      try {
        const historicalResponse = await fetch(`${request.nextUrl.origin}/api/historical-events?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
        
        if (historicalResponse.ok) {
          const { events: historicalEvents } = await historicalResponse.json();
          
          if (historicalEvents && historicalEvents.length > 0) {
            // Use the most significant historical event
            const significantEvent = historicalEvents[0];
            historicalContext = `${significantEvent.title}: ${significantEvent.description}`;
            narrative = await generateNarrative(personalEventText, historicalContext);
          }
        }
      } catch (fetchError) {
        console.warn('Failed to fetch historical events:', fetchError);
      }
    }

    // If we still don't have a narrative, generate a personal reflection
    if (!narrative) {
      narrative = await generatePersonalReflection(personalEventText);
    }

    // Store the narrative if eventId is provided
    if (eventId && narrative) {
      try {
        await supabase
          .from('personal_events')
          .update({ narrative })
          .eq('id', eventId)
          .eq('user_id', session.user.id);
      } catch (updateError) {
        console.warn('Failed to store narrative:', updateError);
      }
    }

    return NextResponse.json({ 
      narrative,
      historicalContext,
      generated: true
    });
  } catch (error) {
    console.error('Error generating narrative:', error);
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}

async function generatePersonalReflection(eventText: string): Promise<string> {
  // Generate a personal reflection when no historical context is available
  const reflectionPrompts = [
    `This moment in your life - ${eventText} - represents a significant step in your personal journey. Every experience shapes who you become.`,
    `Looking back at ${eventText}, this event marks an important chapter in your story. Personal growth often comes from both planned milestones and unexpected moments.`,
    `${eventText} stands as a meaningful point in your timeline. These personal experiences create the unique narrative of your life.`,
    `The significance of ${eventText} in your life story cannot be understated. These are the moments that define your personal evolution and growth.`,
    `${eventText} represents more than just an event - it's a building block in the architecture of your life experience.`
  ];
  
  return reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
}
