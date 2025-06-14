'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineWeek, PersonalEvent } from '@/types';
import { createClient } from '@/lib/supabase-client';
import { CalendarDaysIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface TimelineViewProps {
  userId: string;
}

interface WeekDetailProps {
  week: TimelineWeek;
  onClose: () => void;
}

function WeekDetail({ week, onClose }: WeekDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Week {week.weekNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {new Date(week.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          {week.personalEvents.length > 0 ? (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                Personal Events
              </h4>
              <div className="space-y-2">
                {week.personalEvents.map((event) => (
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

          {week.narrative && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2" />
                AI Narrative
              </h4>
              <p className="text-sm text-gray-600 italic">{week.narrative}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TimelineView({ userId }: TimelineViewProps) {
  const [weeks, setWeeks] = useState<TimelineWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<TimelineWeek | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTimelineData() {
      try {
        const supabase = createClient();

        // Fetch user's birthdate - if not exists, use a default
        let birthDate = new Date('1990-01-01'); // Default birthdate

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('birthdate')
          .eq('id', userId)
          .single();

        if (userData?.birthdate) {
          birthDate = new Date(userData.birthdate);
        }

        // Fetch personal events
        const { data: events, error: eventsError } = await supabase
          .from('personal_events')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (eventsError) throw eventsError;

        // Calculate weeks from birthdate to now
        const now = new Date();
        const weeksCount = Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        // Create timeline weeks
        const timelineWeeks: TimelineWeek[] = Array.from({ length: Math.max(weeksCount, 1040) }, (_, i) => {
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
            historicalEvents: [], // Will be populated with API call
          };
        });

        setWeeks(timelineWeeks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimelineData();
  }, [userId]);

  const getWeekColor = (week: TimelineWeek) => {
    if (week.personalEvents.length === 0) return 'timeline-week-empty';

    const sentiments = week.personalEvents.map(e => e.sentiment);
    const hasPositive = sentiments.includes('positive');
    const hasNegative = sentiments.includes('negative');

    if (hasPositive && hasNegative) return 'timeline-week-mixed';
    if (hasPositive) return 'timeline-week-positive';
    if (hasNegative) return 'timeline-week-negative';
    return 'timeline-week-neutral';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>Error loading timeline: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Age markers */}
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80].map(age => (
            <div key={age} className="text-center">
              {age}
            </div>
          ))}
        </div>

        {/* Timeline grid */}
        <div className="grid grid-cols-52 gap-1 max-w-full overflow-x-auto">
          {weeks.map((week, index) => (
            <motion.div
              key={week.weekNumber}
              className={`timeline-week ${getWeekColor(week)}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.001 }}
              whileHover={{
                scale: 1.2,
                zIndex: 10,
                transition: { duration: 0.1 }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedWeek(week)}
              onMouseEnter={() => setHoveredWeek(week.weekNumber)}
              onMouseLeave={() => setHoveredWeek(null)}
              title={`Week ${week.weekNumber} - ${new Date(week.date).toLocaleDateString()}`}
            />
          ))}
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredWeek && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none z-20"
            >
              Week {hoveredWeek}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Week detail modal */}
      <AnimatePresence>
        {selectedWeek && (
          <WeekDetail
            week={selectedWeek}
            onClose={() => setSelectedWeek(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}