'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { historicalEventsService, type HistoricalEvent } from '@/lib/historical-events';

export default function HistoricalEventsPage() {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<'wikipedia' | 'local'>('local');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoricalEvents();
  }, [selectedDate]);

  const fetchHistoricalEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const date = new Date(selectedDate);
      console.log(`Fetching events for ${date.toDateString()}`);
      
      // Try Wikipedia API first
      const wikipediaEvents = await historicalEventsService.getEventsForDate(date);
      
      if (wikipediaEvents.length > 0) {
        setEvents(wikipediaEvents);
        setSource('wikipedia');
        console.log(`Found ${wikipediaEvents.length} Wikipedia events`);
      } else {
        // Fallback to API endpoint
        const response = await fetch(
          `/api/historical-events?startDate=${date.toISOString()}&limit=15&wikipedia=true`
        );

        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
          setSource(data.source || 'local');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error fetching historical events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'science & technology':
        return '🔬';
      case 'war & conflict':
        return '⚔️';
      case 'politics':
        return '🏛️';
      case 'arts & culture':
        return '🎨';
      case 'people':
        return '👤';
      case 'sports':
        return '🏆';
      case 'natural disasters':
        return '🌪️';
      default:
        return '📚';
    }
  };

  const getSignificanceColor = (significance?: string) => {
    switch (significance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">Historical Events</h1>
                  <p className="text-blue-100">Discover what happened on any day in history</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              {source === 'wikipedia' ? (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Live from Wikipedia</span>
                </>
              ) : (
                <>
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span>Curated Data</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Date</h2>
              <p className="text-gray-600">Choose any date to explore historical events</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={fetchHistoricalEvents}
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                )}
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin mr-3" />
            <span className="text-gray-600 text-lg">Loading historical events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-600 mb-4">
              <ExternalLinkIcon className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={fetchHistoricalEvents}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">
              No historical events found for {new Date(selectedDate).toLocaleDateString()}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Events on {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-gray-600 mt-1">
                  {events.length} event{events.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="text-3xl">{getCategoryIcon(event.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 leading-tight">
                          {event.title}
                        </h4>
                        {event.significance && (
                          <span className={`
                            px-2 py-1 text-xs rounded-full border ml-2 flex-shrink-0
                            ${getSignificanceColor(event.significance)}
                          `}>
                            {event.significance}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {event.category}
                      </span>
                      {event.source === 'wikipedia' && (
                        <span className="flex items-center">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Wikipedia
                        </span>
                      )}
                    </div>
                    
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <span>Learn more</span>
                        <ExternalLinkIcon className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                  
                  {event.imageUrl && (
                    <div className="mt-4">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            {source === 'wikipedia' 
              ? 'Historical data sourced from Wikipedia API' 
              : 'Using curated historical data'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
