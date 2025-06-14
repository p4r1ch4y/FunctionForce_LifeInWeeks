// Populate historical events in the database

import { createClient } from './supabase-client';

export interface HistoricalEventData {
  date: string;
  title: string;
  description: string;
  category: string;
}

// Comprehensive historical events data
export const historicalEventsData: HistoricalEventData[] = [
  // Technology & Science
  {
    date: '2007-06-29',
    title: 'iPhone Launch',
    description: 'Apple launches the first iPhone, revolutionizing mobile technology and changing how we interact with devices',
    category: 'Technology'
  },
  {
    date: '2004-02-04',
    title: 'Facebook Launch',
    description: 'Facebook is launched by Mark Zuckerberg at Harvard University, beginning the social media revolution',
    category: 'Technology'
  },
  {
    date: '1969-07-20',
    title: 'Moon Landing',
    description: 'Apollo 11 lands on the moon, Neil Armstrong becomes first human to walk on lunar surface',
    category: 'Science'
  },
  {
    date: '1989-03-12',
    title: 'World Wide Web',
    description: 'Tim Berners-Lee proposes the World Wide Web, revolutionizing global communication',
    category: 'Technology'
  },
  {
    date: '2003-04-14',
    title: 'Human Genome Project',
    description: 'Human Genome Project completed, mapping all human DNA sequences',
    category: 'Science'
  },

  // Global Events & Politics
  {
    date: '2001-09-11',
    title: '9/11 Terrorist Attacks',
    description: 'Terrorist attacks on the World Trade Center and Pentagon change global security forever',
    category: 'Global Events'
  },
  {
    date: '1989-11-09',
    title: 'Berlin Wall Falls',
    description: 'The Berlin Wall falls, symbolizing the end of the Cold War and German reunification',
    category: 'Politics'
  },
  {
    date: '1991-12-26',
    title: 'Soviet Union Dissolves',
    description: 'The Soviet Union officially dissolves, ending the Cold War era',
    category: 'Politics'
  },
  {
    date: '2008-11-04',
    title: 'Obama Elected',
    description: 'Barack Obama elected as first African American President of the United States',
    category: 'Politics'
  },
  {
    date: '2016-06-23',
    title: 'Brexit Vote',
    description: 'United Kingdom votes to leave the European Union in historic referendum',
    category: 'Politics'
  },

  // Economics & Finance
  {
    date: '2008-09-15',
    title: 'Financial Crisis',
    description: 'Lehman Brothers collapse triggers global financial crisis and recession',
    category: 'Economics'
  },
  {
    date: '1929-10-29',
    title: 'Black Tuesday',
    description: 'Stock market crash triggers the Great Depression',
    category: 'Economics'
  },
  {
    date: '2009-01-03',
    title: 'Bitcoin Genesis',
    description: 'First Bitcoin block mined, beginning the cryptocurrency revolution',
    category: 'Economics'
  },
  {
    date: '1971-08-15',
    title: 'Nixon Shock',
    description: 'US abandons gold standard, fundamentally changing global monetary system',
    category: 'Economics'
  },

  // Health & Pandemics
  {
    date: '2020-03-11',
    title: 'COVID-19 Pandemic Declared',
    description: 'WHO declares COVID-19 a global pandemic, affecting billions worldwide',
    category: 'Health'
  },
  {
    date: '1981-06-05',
    title: 'AIDS First Reported',
    description: 'First cases of AIDS reported, beginning a global health crisis',
    category: 'Health'
  },
  {
    date: '1955-04-12',
    title: 'Polio Vaccine',
    description: 'Jonas Salk announces successful polio vaccine, saving millions of lives',
    category: 'Health'
  },
  {
    date: '2003-04-16',
    title: 'SARS Outbreak',
    description: 'SARS coronavirus outbreak spreads globally, foreshadowing future pandemics',
    category: 'Health'
  },

  // Natural Disasters
  {
    date: '2004-12-26',
    title: 'Indian Ocean Tsunami',
    description: 'Massive tsunami kills over 230,000 people across 14 countries',
    category: 'Natural Disaster'
  },
  {
    date: '2011-03-11',
    title: 'Japan Earthquake',
    description: 'Magnitude 9.0 earthquake and tsunami devastate Japan, cause Fukushima nuclear disaster',
    category: 'Natural Disaster'
  },
  {
    date: '2005-08-29',
    title: 'Hurricane Katrina',
    description: 'Hurricane Katrina devastates New Orleans and Gulf Coast',
    category: 'Natural Disaster'
  },
  {
    date: '1986-04-26',
    title: 'Chernobyl Disaster',
    description: 'Nuclear reactor explosion in Ukraine causes worst nuclear disaster in history',
    category: 'Natural Disaster'
  },

  // Arts & Culture
  {
    date: '1969-08-15',
    title: 'Woodstock Festival',
    description: 'Iconic music festival defines counterculture movement and generation',
    category: 'Culture'
  },
  {
    date: '1977-05-25',
    title: 'Star Wars Premiere',
    description: 'Star Wars premieres, revolutionizing cinema and popular culture',
    category: 'Culture'
  },
  {
    date: '1981-08-01',
    title: 'MTV Launches',
    description: 'MTV begins broadcasting, changing music industry and youth culture',
    category: 'Culture'
  },
  {
    date: '1985-07-13',
    title: 'Live Aid Concert',
    description: 'Global benefit concert raises awareness and funds for African famine relief',
    category: 'Culture'
  },

  // Sports
  {
    date: '1980-02-22',
    title: 'Miracle on Ice',
    description: 'US hockey team defeats Soviet Union in Olympics, iconic Cold War moment',
    category: 'Sports'
  },
  {
    date: '1992-08-11',
    title: 'Dream Team Olympics',
    description: 'US basketball Dream Team dominates Olympics, globalizing NBA',
    category: 'Sports'
  },
  {
    date: '1999-07-10',
    title: 'Women\'s World Cup',
    description: 'US women win World Cup, Brandi Chastain celebration becomes iconic',
    category: 'Sports'
  },
  {
    date: '2008-08-08',
    title: 'Beijing Olympics',
    description: 'China hosts Olympics, showcasing economic rise to global audience',
    category: 'Sports'
  },

  // Recent Events (2010s-2020s)
  {
    date: '2011-05-02',
    title: 'Bin Laden Killed',
    description: 'Osama bin Laden killed by US forces, ending decade-long manhunt',
    category: 'Global Events'
  },
  {
    date: '2013-06-06',
    title: 'Snowden Revelations',
    description: 'Edward Snowden reveals NSA surveillance programs, sparking privacy debates',
    category: 'Politics'
  },
  {
    date: '2016-11-08',
    title: 'Trump Elected',
    description: 'Donald Trump elected US President in upset victory',
    category: 'Politics'
  },
  {
    date: '2019-12-31',
    title: 'COVID-19 Emerges',
    description: 'First cases of mysterious pneumonia reported in Wuhan, China',
    category: 'Health'
  },
  {
    date: '2021-01-06',
    title: 'Capitol Riot',
    description: 'Supporters of Donald Trump storm US Capitol building',
    category: 'Politics'
  },
  {
    date: '2022-02-24',
    title: 'Russia Invades Ukraine',
    description: 'Russia launches full-scale invasion of Ukraine, major European conflict',
    category: 'Global Events'
  }
];

// Function to populate historical events in the database
export async function populateHistoricalEvents(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const supabase = createClient();

    // Check if events already exist
    const { data: existingEvents, error: checkError } = await supabase
      .from('historical_events')
      .select('id')
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (existingEvents && existingEvents.length > 0) {
      return {
        success: true,
        message: 'Historical events already exist in database',
        count: 0
      };
    }

    // Insert historical events
    const { data, error } = await supabase
      .from('historical_events')
      .insert(historicalEventsData)
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Historical events populated successfully',
      count: data?.length || 0
    };

  } catch (error) {
    console.error('Error populating historical events:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to get historical events count
export async function getHistoricalEventsCount(): Promise<number> {
  try {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('historical_events')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting historical events count:', error);
    return 0;
  }
}
