// Historical Events Service - Wikipedia API Integration

export interface HistoricalEvent {
  id?: string;
  date: string;
  title: string;
  description: string;
  category: string;
  source: 'wikipedia' | 'local' | 'api';
  url?: string;
  imageUrl?: string;
  significance?: 'high' | 'medium' | 'low';
}

export interface WikipediaEvent {
  text: string;
  pages?: Array<{
    title: string;
    extract: string;
    thumbnail?: {
      source: string;
    };
  }>;
}

// Wikipedia API service
export class WikipediaService {
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1';
  private apiUrl = 'https://api.wikimedia.org/feed/v1/wikipedia/en';

  async getOnThisDay(month: number, day: number): Promise<HistoricalEvent[]> {
    try {
      const url = `${this.apiUrl}/onthisday/all/${month}/${day}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LifeWeeks/1.0 (https://lifeweeks.app) Educational Purpose'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json();
      const events: HistoricalEvent[] = [];

      // Process different types of events
      const eventTypes = ['events', 'births', 'deaths'];
      
      for (const eventType of eventTypes) {
        if (data[eventType]) {
          for (const event of data[eventType].slice(0, 5)) { // Limit to 5 per type
            const historicalEvent = await this.processWikipediaEvent(event, eventType);
            if (historicalEvent) {
              events.push(historicalEvent);
            }
          }
        }
      }

      return events;
    } catch (error) {
      console.error('Error fetching Wikipedia "On This Day" data:', error);
      return [];
    }
  }

  async getEventsForDateRange(startDate: Date, endDate: Date): Promise<HistoricalEvent[]> {
    const events: HistoricalEvent[] = [];
    const currentDate = new Date(startDate);

    // Fetch events for each day in the range (limit to avoid too many API calls)
    const maxDays = 7; // Limit to 1 week to avoid rate limiting
    let dayCount = 0;

    while (currentDate <= endDate && dayCount < maxDays) {
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      
      try {
        const dayEvents = await this.getOnThisDay(month, day);
        events.push(...dayEvents);
      } catch (error) {
        console.warn(`Failed to fetch events for ${month}/${day}:`, error);
      }

      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return events;
  }

  private async processWikipediaEvent(event: any, eventType: string): Promise<HistoricalEvent | null> {
    try {
      const year = event.year || new Date().getFullYear();
      const title = event.text || event.title || 'Historical Event';
      
      let description = '';
      let imageUrl = '';
      let url = '';

      // Get more details from pages if available
      if (event.pages && event.pages.length > 0) {
        const page = event.pages[0];
        description = page.extract || event.text || '';
        imageUrl = page.thumbnail?.source || '';
        url = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`;
      } else {
        description = event.text || '';
      }

      // Clean up description
      description = description.replace(/\([^)]*\)/g, '').trim();
      if (description.length > 200) {
        description = description.substring(0, 200) + '...';
      }

      // Determine category based on event type and content
      const category = this.categorizeEvent(title, description, eventType);

      return {
        date: `${year}-01-01`, // We'll adjust this based on the actual date
        title: this.cleanTitle(title),
        description,
        category,
        source: 'wikipedia',
        url,
        imageUrl,
        significance: this.assessSignificance(title, description)
      };
    } catch (error) {
      console.warn('Error processing Wikipedia event:', error);
      return null;
    }
  }

  private categorizeEvent(title: string, description: string, eventType: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (eventType === 'births' || eventType === 'deaths') {
      return 'People';
    }

    if (text.includes('war') || text.includes('battle') || text.includes('conflict')) {
      return 'War & Conflict';
    }
    
    if (text.includes('discover') || text.includes('invent') || text.includes('science') || text.includes('technology')) {
      return 'Science & Technology';
    }
    
    if (text.includes('art') || text.includes('music') || text.includes('literature') || text.includes('culture')) {
      return 'Arts & Culture';
    }
    
    if (text.includes('politic') || text.includes('government') || text.includes('election') || text.includes('treaty')) {
      return 'Politics';
    }
    
    if (text.includes('disaster') || text.includes('earthquake') || text.includes('flood') || text.includes('hurricane')) {
      return 'Natural Disasters';
    }
    
    if (text.includes('sport') || text.includes('olympic') || text.includes('championship')) {
      return 'Sports';
    }

    return 'General History';
  }

  private cleanTitle(title: string): string {
    // Remove year prefixes and clean up the title
    return title
      .replace(/^\d{4}[\s\-–]+/, '') // Remove year prefix
      .replace(/\s+/g, ' ')
      .trim();
  }

  private assessSignificance(title: string, description: string): 'high' | 'medium' | 'low' {
    const text = `${title} ${description}`.toLowerCase();
    
    const highSignificanceKeywords = [
      'world war', 'revolution', 'independence', 'assassination', 'discovery',
      'invention', 'first', 'founded', 'established', 'treaty', 'constitution'
    ];
    
    const mediumSignificanceKeywords = [
      'battle', 'election', 'born', 'died', 'published', 'opened', 'launched'
    ];

    if (highSignificanceKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    if (mediumSignificanceKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }
}

// Additional public APIs integration
export class PublicEventsService {
  async getNewsEvents(date: Date): Promise<HistoricalEvent[]> {
    // This would integrate with news APIs for more recent events
    // For now, return empty array as it requires API keys
    return [];
  }

  async getCulturalEvents(date: Date): Promise<HistoricalEvent[]> {
    // This could integrate with cultural/arts APIs
    return [];
  }
}

// Main service that combines all sources
export class HistoricalEventsService {
  private wikipedia = new WikipediaService();
  private publicEvents = new PublicEventsService();

  async getEventsForDate(date: Date): Promise<HistoricalEvent[]> {
    const events: HistoricalEvent[] = [];

    try {
      // Get Wikipedia events for this day
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const wikipediaEvents = await this.wikipedia.getOnThisDay(month, day);
      
      // Adjust dates to match the requested date
      const adjustedEvents = wikipediaEvents.map(event => ({
        ...event,
        date: date.toISOString().split('T')[0]
      }));

      events.push(...adjustedEvents);

      // Could add more sources here
      // const newsEvents = await this.publicEvents.getNewsEvents(date);
      // events.push(...newsEvents);

    } catch (error) {
      console.error('Error fetching historical events:', error);
    }

    return events;
  }

  async getEventsForWeek(startDate: Date): Promise<HistoricalEvent[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return await this.wikipedia.getEventsForDateRange(startDate, endDate);
  }

  async searchEvents(query: string, limit: number = 10): Promise<HistoricalEvent[]> {
    // This could implement Wikipedia search
    // For now, return empty array
    return [];
  }
}

// Singleton instance
export const historicalEventsService = new HistoricalEventsService();
