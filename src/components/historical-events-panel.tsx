'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  SparklesIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { HistoricalEvent } from '@/lib/historical-events';

interface HistoricalEventsPanelProps {
  selectedDate?: Date;
  isVisible: boolean;
  onClose: () => void;
}

export default function HistoricalEventsPanel({ 
  selectedDate, 
  isVisible, 
  onClose 
}: HistoricalEventsPanelProps) {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<'wikipedia' | 'local'>('local');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && selectedDate) {
      fetchHistoricalEvents();
    }
  }, [isVisible, selectedDate]);

  const fetchHistoricalEvents = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/historical-events?startDate=${selectedDate.toISOString()}&limit=8&wikipedia=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(data.events || []);
      setSource(data.source || 'local');
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">Historical Events</h2>
                  <p className="text-blue-100">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  {source === 'wikipedia' ? (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Live from Wikipedia</span>
                    </>
                  ) : (
                    <>
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>Local Data</span>
                    </>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin mr-3" />
                <span className="text-gray-600">Loading historical events...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <ExternalLinkIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-medium">Failed to load events</p>
                  <p className="text-sm text-gray-600">{error}</p>
                </div>
                <button
                  onClick={fetchHistoricalEvents}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600">
                  No historical events found for this date.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Events on this day in history
                  </h3>
                  <span className="text-sm text-gray-500">
                    {events.length} event{events.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                {events.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getCategoryIcon(event.category)}</div>
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
                        
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
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
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <span>Learn more</span>
                              <ExternalLinkIcon className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {event.imageUrl && (
                      <div className="mt-3">
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
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-4 h-4" />
                <span>
                  {source === 'wikipedia' 
                    ? 'Data sourced from Wikipedia API' 
                    : 'Using curated historical data'
                  }
                </span>
              </div>
              <button
                onClick={fetchHistoricalEvents}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
