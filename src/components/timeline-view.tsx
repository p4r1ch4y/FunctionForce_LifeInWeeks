'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { TimelineWeek, PersonalEvent } from '@/types';
import { createClient } from '@/lib/supabase';

interface TimelineViewProps {
  userId: string;
}

export default function TimelineView({ userId }: TimelineViewProps) {
  const [weeks, setWeeks] = useState<TimelineWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimelineData() {
      try {
        const supabase = createClient();
        
        // Fetch user's birthdate
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('birthdate')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        // Fetch personal events
        const { data: events, error: eventsError } = await supabase
          .from('personal_events')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (eventsError) throw eventsError;

        // Calculate weeks from birthdate to now
        const birthDate = new Date(userData.birthdate);
        const now = new Date();
        const weeksCount = Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        // Create timeline weeks
        const timelineWeeks: TimelineWeek[] = Array.from({ length: weeksCount }, (_, i) => {
          const weekDate = new Date(birthDate);
          weekDate.setDate(weekDate.getDate() + i * 7);

          return {
            weekNumber: i + 1,
            date: weekDate.toISOString(),
            personalEvents: events.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate >= weekDate && eventDate < new Date(weekDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            }),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Error loading timeline: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-52 gap-1">
      {weeks.map((week) => (
        <motion.div
          key={week.weekNumber}
          className={`
            aspect-square rounded-sm
            ${week.personalEvents.length > 0 ? 'bg-blue-500' : 'bg-gray-200'}
            hover:scale-110 transition-transform cursor-pointer
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      ))}
    </div>
  );
} 