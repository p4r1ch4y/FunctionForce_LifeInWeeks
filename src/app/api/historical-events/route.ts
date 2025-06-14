import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { historicalEventsService, type HistoricalEvent } from '@/lib/historical-events';

// Fallback historical events database (used when Wikipedia API fails)
const FALLBACK_HISTORICAL_EVENTS = [
  // Technology & Innovation
  { date: '2007-06-29', title: 'iPhone Launch', description: 'Apple launches the first iPhone, revolutionizing mobile technology', category: 'Technology' },
  { date: '2004-02-04', title: 'Facebook Launch', description: 'Facebook is launched by Mark Zuckerberg at Harvard University', category: 'Technology' },
  { date: '2005-02-14', title: 'YouTube Founded', description: 'YouTube is founded, changing how we share and consume video content', category: 'Technology' },
  { date: '2006-07-15', title: 'Twitter Launch', description: 'Twitter launches, introducing microblogging to the world', category: 'Technology' },
  { date: '2008-09-23', title: 'Android Launch', description: 'Google launches Android, the open-source mobile operating system', category: 'Technology' },
  { date: '2010-04-03', title: 'iPad Launch', description: 'Apple introduces the iPad, creating the modern tablet market', category: 'Technology' },
  { date: '2016-03-09', title: 'AlphaGo Defeats Human Champion', description: 'Google\'s AlphaGo defeats world Go champion Lee Sedol', category: 'Technology' },
  { date: '2022-11-30', title: 'ChatGPT Launch', description: 'OpenAI launches ChatGPT, bringing AI to mainstream users', category: 'Technology' },

  // Global Events & Politics
  { date: '2001-09-11', title: '9/11 Terrorist Attacks', description: 'Terrorist attacks on the World Trade Center and Pentagon', category: 'Global Events' },
  { date: '2008-09-15', title: 'Financial Crisis', description: 'Lehman Brothers collapse triggers global financial crisis', category: 'Economics' },
  { date: '2020-03-11', title: 'COVID-19 Pandemic Declared', description: 'WHO declares COVID-19 a global pandemic', category: 'Health' },
  { date: '2016-11-08', title: 'US Presidential Election', description: 'Donald Trump wins US Presidential Election', category: 'Politics' },
  { date: '2020-11-07', title: 'Biden Wins Presidency', description: 'Joe Biden declared winner of 2020 US Presidential Election', category: 'Politics' },
  { date: '2016-06-23', title: 'Brexit Vote', description: 'UK votes to leave the European Union', category: 'Politics' },
  { date: '2011-05-02', title: 'Osama bin Laden Killed', description: 'US forces kill Osama bin Laden in Pakistan', category: 'Global Events' },
  { date: '2013-06-06', title: 'NSA Surveillance Revealed', description: 'Edward Snowden reveals NSA surveillance programs', category: 'Politics' },

  // Climate & Environment
  { date: '2015-12-12', title: 'Paris Climate Agreement', description: 'Historic climate agreement signed by 196 countries', category: 'Environment' },
  { date: '2019-09-23', title: 'Greta Thunberg UN Speech', description: 'Greta Thunberg delivers powerful climate speech at UN', category: 'Environment' },
  { date: '2021-11-01', title: 'COP26 Climate Summit', description: 'Major climate summit held in Glasgow, Scotland', category: 'Environment' },

  // Space & Science
  { date: '2012-08-05', title: 'Curiosity Rover Lands on Mars', description: 'NASA\'s Curiosity rover successfully lands on Mars', category: 'Science' },
  { date: '2019-04-10', title: 'First Black Hole Image', description: 'Scientists capture the first image of a black hole', category: 'Science' },
  { date: '2020-05-30', title: 'SpaceX Crew Dragon Launch', description: 'First commercial crew mission to International Space Station', category: 'Science' },
  { date: '2021-02-18', title: 'Perseverance Rover Lands on Mars', description: 'NASA\'s Perseverance rover lands on Mars with Ingenuity helicopter', category: 'Science' },

  // Cultural & Social
  { date: '2017-10-05', title: '#MeToo Movement', description: 'Harvey Weinstein allegations spark global #MeToo movement', category: 'Social' },
  { date: '2020-05-25', title: 'George Floyd Death', description: 'Death of George Floyd sparks global Black Lives Matter protests', category: 'Social' },
  { date: '2018-03-17', title: 'Cambridge Analytica Scandal', description: 'Facebook-Cambridge Analytica data scandal exposed', category: 'Technology' },
  { date: '2012-12-21', title: 'Mayan Calendar End', description: 'End of the Mayan Long Count calendar sparks apocalypse theories', category: 'Cultural' },

  // Sports & Entertainment
  { date: '2008-08-08', title: 'Beijing Olympics', description: 'Summer Olympics held in Beijing, China', category: 'Sports' },
  { date: '2012-07-27', title: 'London Olympics', description: 'Summer Olympics held in London, UK', category: 'Sports' },
  { date: '2016-08-05', title: 'Rio Olympics', description: 'Summer Olympics held in Rio de Janeiro, Brazil', category: 'Sports' },
  { date: '2021-07-23', title: 'Tokyo Olympics', description: 'Delayed Summer Olympics held in Tokyo, Japan during pandemic', category: 'Sports' },

  // Economic Events
  { date: '2009-01-03', title: 'Bitcoin Genesis Block', description: 'First Bitcoin block mined, creating the first cryptocurrency', category: 'Economics' },
  { date: '2017-12-17', title: 'Bitcoin Reaches $20,000', description: 'Bitcoin reaches all-time high of nearly $20,000', category: 'Economics' },
  { date: '2021-03-11', title: 'NFT Art Sells for $69M', description: 'Beeple\'s digital art NFT sells for record $69.3 million', category: 'Technology' },

  // Natural Disasters
  { date: '2004-12-26', title: 'Indian Ocean Tsunami', description: 'Devastating tsunami affects 14 countries, killing 230,000+ people', category: 'Natural Disaster' },
  { date: '2011-03-11', title: 'Japan Earthquake and Tsunami', description: 'Magnitude 9.0 earthquake and tsunami hit Japan, causing Fukushima disaster', category: 'Natural Disaster' },
  { date: '2005-08-29', title: 'Hurricane Katrina', description: 'Category 5 hurricane devastates New Orleans and Gulf Coast', category: 'Natural Disaster' },
];

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = createClient();

    // Handle authentication check safely
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const useWikipedia = searchParams.get('wikipedia') !== 'false'; // Default to true

    let events: HistoricalEvent[] = [];

    // Try to fetch from Wikipedia API first
    if (useWikipedia && startDate) {
      try {
        const date = new Date(startDate);
        console.log(`Fetching Wikipedia events for ${date.toDateString()}`);

        const wikipediaEvents = await historicalEventsService.getEventsForDate(date);

        if (wikipediaEvents.length > 0) {
          events = wikipediaEvents;
          console.log(`Found ${wikipediaEvents.length} Wikipedia events`);
        } else {
          console.log('No Wikipedia events found, using fallback data');
          events = FALLBACK_HISTORICAL_EVENTS.map(event => ({
            ...event,
            source: 'local' as const
          }));
        }
      } catch (wikipediaError) {
        console.warn('Wikipedia API failed, using fallback data:', wikipediaError);
        events = FALLBACK_HISTORICAL_EVENTS.map(event => ({
          ...event,
          source: 'local' as const
        }));
      }
    } else {
      // Use fallback data
      events = FALLBACK_HISTORICAL_EVENTS.map(event => ({
        ...event,
        source: 'local' as const
      }));
    }

    // Filter by date range (for fallback data)
    if (startDate && endDate && events === FALLBACK_HISTORICAL_EVENTS) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      events = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Filter by category
    if (category) {
      events = events.filter(event =>
        event.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort by significance and date, then limit results
    events = events
      .sort((a, b) => {
        // Sort by significance first (high > medium > low)
        const significanceOrder = { high: 3, medium: 2, low: 1 };
        const aSignificance = significanceOrder[a.significance || 'low'];
        const bSignificance = significanceOrder[b.significance || 'low'];

        if (aSignificance !== bSignificance) {
          return bSignificance - aSignificance;
        }

        // Then by date (most recent first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, limit);

    // Get all available categories
    const allCategories = Array.from(new Set([
      ...FALLBACK_HISTORICAL_EVENTS.map(e => e.category),
      ...events.map(e => e.category)
    ]));

    return NextResponse.json({
      events,
      total: events.length,
      categories: allCategories,
      source: events.length > 0 && events[0].source === 'wikipedia' ? 'wikipedia' : 'local',
      message: events.length > 0 && events[0].source === 'wikipedia'
        ? 'Data fetched from Wikipedia API'
        : 'Using local historical data'
    });
  } catch (error) {
    console.error('Error fetching historical events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical events' },
      { status: 500 }
    );
  }
}

// Utility functions (not exported as route handlers)
function getHistoricalEventsForWeek(weekStart: Date, weekEnd: Date) {
  return FALLBACK_HISTORICAL_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });
}

function getEventsByYear(year: number) {
  return FALLBACK_HISTORICAL_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year;
  });
}

function getRandomHistoricalEvent() {
  const randomIndex = Math.floor(Math.random() * FALLBACK_HISTORICAL_EVENTS.length);
  return FALLBACK_HISTORICAL_EVENTS[randomIndex];
}
