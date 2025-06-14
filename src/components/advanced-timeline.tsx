'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';
import HistoricalEventsPanel from './historical-events-panel';
import { TimelineWeek, PersonalEvent } from '@/types';

interface AdvancedTimelineProps {
  userId: string;
}

interface TimelineSettings {
  showEmptyWeeks: boolean;
  colorMode: 'sentiment' | 'category' | 'intensity';
  zoomLevel: number;
  autoPlay: boolean;
  playSpeed: number;
}

export default function AdvancedTimeline({ userId }: AdvancedTimelineProps) {
  const [weeks, setWeeks] = useState<TimelineWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<TimelineWeek | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<TimelineSettings>({
    showEmptyWeeks: true,
    colorMode: 'sentiment',
    zoomLevel: 1,
    autoPlay: false,
    playSpeed: 100
  });
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistoricalEvents, setShowHistoricalEvents] = useState(false);
  const [historicalEventsDate, setHistoricalEventsDate] = useState<Date | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTimelineData();
  }, [userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (settings.autoPlay && weeks.length > 0) {
      interval = setInterval(() => {
        setCurrentWeekIndex(prev => (prev + 1) % weeks.length);
      }, settings.playSpeed);
    }
    return () => clearInterval(interval);
  }, [settings.autoPlay, settings.playSpeed, weeks.length]);

  const fetchTimelineData = async () => {
    try {
      const supabase = createClient();
      
      // Get user birthdate
      let birthDate = new Date('1990-01-01');
      const { data: userData } = await supabase
        .from('users')
        .select('birthdate')
        .eq('id', userId)
        .single();

      if (userData?.birthdate) {
        birthDate = new Date(userData.birthdate);
      }

      // Get events
      const { data: events, error } = await supabase
        .from('personal_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;

      // Generate timeline weeks
      const now = new Date();
      const totalWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      const timelineWeeks: TimelineWeek[] = Array.from({ length: Math.max(totalWeeks, 1040) }, (_, i) => {
        const weekDate = new Date(birthDate);
        weekDate.setDate(weekDate.getDate() + i * 7);

        const weekEvents = (events || []).filter(event => {
          const eventDate = new Date(event.date);
          const weekEnd = new Date(weekDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          return eventDate >= weekDate && eventDate < weekEnd;
        });

        return {
          weekNumber: i + 1,
          date: weekDate.toISOString(),
          personalEvents: weekEvents,
          historicalEvents: [],
        };
      });

      setWeeks(timelineWeeks);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekColor = (week: TimelineWeek) => {
    if (week.personalEvents.length === 0) {
      return settings.showEmptyWeeks ? 'bg-gray-100 hover:bg-gray-200' : 'hidden';
    }

    switch (settings.colorMode) {
      case 'sentiment':
        return getSentimentColor(week);
      case 'category':
        return getCategoryColor(week);
      case 'intensity':
        return getIntensityColor(week);
      default:
        return getSentimentColor(week);
    }
  };

  const getSentimentColor = (week: TimelineWeek) => {
    const sentiments = week.personalEvents.map(e => e.sentiment);
    const hasPositive = sentiments.includes('positive');
    const hasNegative = sentiments.includes('negative');
    
    if (hasPositive && hasNegative) {
      return 'bg-gradient-to-br from-green-400 to-red-400 hover:from-green-500 hover:to-red-500';
    }
    if (hasPositive) return 'bg-green-400 hover:bg-green-500';
    if (hasNegative) return 'bg-red-400 hover:bg-red-500';
    return 'bg-blue-400 hover:bg-blue-500';
  };

  const getCategoryColor = (week: TimelineWeek) => {
    const categories = week.personalEvents.map(e => e.category);
    const primaryCategory = categories[0];
    
    switch (primaryCategory) {
      case 'Career': return 'bg-purple-400 hover:bg-purple-500';
      case 'Education': return 'bg-blue-400 hover:bg-blue-500';
      case 'Personal': return 'bg-green-400 hover:bg-green-500';
      case 'Travel': return 'bg-orange-400 hover:bg-orange-500';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const getIntensityColor = (week: TimelineWeek) => {
    const eventCount = week.personalEvents.length;
    if (eventCount === 0) return 'bg-gray-100';
    if (eventCount === 1) return 'bg-blue-200 hover:bg-blue-300';
    if (eventCount === 2) return 'bg-blue-400 hover:bg-blue-500';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const filteredWeeks = weeks.filter(week => {
    if (!searchTerm) return true;
    return week.personalEvents.some(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const scrollToWeek = (weekIndex: number) => {
    if (timelineRef.current) {
      const weekElement = timelineRef.current.children[weekIndex] as HTMLElement;
      if (weekElement) {
        weekElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
            className={`p-2 rounded-lg transition-colors ${
              settings.autoPlay 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {settings.autoPlay ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Mode</label>
                <select
                  value={settings.colorMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, colorMode: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="sentiment">Sentiment</option>
                  <option value="category">Category</option>
                  <option value="intensity">Intensity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom Level: {settings.zoomLevel}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={settings.zoomLevel}
                  onChange={(e) => setSettings(prev => ({ ...prev, zoomLevel: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showEmptyWeeks}
                    onChange={(e) => setSettings(prev => ({ ...prev, showEmptyWeeks: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Show empty weeks</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{weeks.length}</div>
          <div className="text-sm text-gray-600">Total Weeks</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {weeks.filter(w => w.personalEvents.some(e => e.sentiment === 'positive')).length}
          </div>
          <div className="text-sm text-gray-600">Positive Weeks</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {weeks.filter(w => w.personalEvents.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Weeks</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-primary-600">
            {Math.round((weeks.filter(w => w.personalEvents.length > 0).length / weeks.length) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Documented</div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div 
          ref={timelineRef}
          className="grid gap-1 overflow-auto max-h-96"
          style={{ 
            gridTemplateColumns: `repeat(52, minmax(0, 1fr))`,
            transform: `scale(${settings.zoomLevel})`,
            transformOrigin: 'top left'
          }}
        >
          {filteredWeeks.map((week, index) => (
            <motion.div
              key={week.weekNumber}
              className={`
                aspect-square rounded-sm cursor-pointer transition-all duration-200
                ${getWeekColor(week)}
                ${currentWeekIndex === index ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
                ${hoveredWeek === week.weekNumber ? 'scale-110 z-10' : ''}
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: hoveredWeek === week.weekNumber ? 1.1 : 1 }}
              transition={{ delay: index * 0.001 }}
              onClick={() => {
                setSelectedWeek(week);
                setCurrentWeekIndex(index);
              }}
              onDoubleClick={() => {
                setHistoricalEventsDate(new Date(week.date));
                setShowHistoricalEvents(true);
              }}
              onMouseEnter={() => setHoveredWeek(week.weekNumber)}
              onMouseLeave={() => setHoveredWeek(null)}
              title={`Week ${week.weekNumber} - ${new Date(week.date).toLocaleDateString()}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
        {settings.colorMode === 'sentiment' && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <span>Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
              <span>Negative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
              <span>Neutral</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-red-400 rounded-sm"></div>
              <span>Mixed</span>
            </div>
          </>
        )}
        
        {settings.colorMode === 'category' && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
              <span>Career</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
              <span>Education</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <span>Personal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
              <span>Travel</span>
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <span>Empty</span>
        </div>
      </div>

      {/* Week Detail Modal */}
      <AnimatePresence>
        {selectedWeek && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Week {selectedWeek.weekNumber}
                </h3>
                <button
                  onClick={() => setSelectedWeek(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {new Date(selectedWeek.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                
                {selectedWeek.personalEvents.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-2" />
                      Events ({selectedWeek.personalEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedWeek.personalEvents.map((event) => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-600">{event.description}</div>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`
                              px-2 py-1 text-xs rounded-full
                              ${event.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                event.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'}
                            `}>
                              {event.sentiment}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No events recorded for this week</p>
                  </div>
                )}

                {/* Historical Events Button */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setHistoricalEventsDate(new Date(selectedWeek.date));
                      setShowHistoricalEvents(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>View Historical Events</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Historical Events Panel */}
      <HistoricalEventsPanel
        selectedDate={historicalEventsDate || undefined}
        isVisible={showHistoricalEvents}
        onClose={() => setShowHistoricalEvents(false)}
      />
    </div>
  );
}
