'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  CalendarDaysIcon,
  GiftIcon,
  HeartIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';
import type { PersonalEvent } from '@/types';

interface Anniversary {
  id: string;
  event: PersonalEvent;
  originalDate: Date;
  nextAnniversary: Date;
  yearsAgo: number;
  daysUntil: number;
  milestone: boolean; // 5, 10, 15, 20, 25+ year milestones
}

interface AnniversaryRemindersProps {
  userId: string;
}

export default function AnniversaryReminders({ userId }: AnniversaryRemindersProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAnniversaries();
  }, [userId]);

  const fetchAnniversaries = async () => {
    try {
      const supabase = createClient();
      
      const { data: events, error } = await supabase
        .from('personal_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;

      const now = new Date();
      const upcomingAnniversaries: Anniversary[] = [];

      events?.forEach(event => {
        const eventDate = new Date(event.date);
        const currentYear = now.getFullYear();
        
        // Calculate next anniversary
        const nextAnniversary = new Date(eventDate);
        nextAnniversary.setFullYear(currentYear);
        
        // If anniversary already passed this year, set to next year
        if (nextAnniversary < now) {
          nextAnniversary.setFullYear(currentYear + 1);
        }
        
        const yearsAgo = nextAnniversary.getFullYear() - eventDate.getFullYear();
        const daysUntil = Math.ceil((nextAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only include anniversaries that are at least 1 year old and within next 90 days
        if (yearsAgo >= 1 && daysUntil <= 90) {
          const milestone = [5, 10, 15, 20, 25, 30, 40, 50].includes(yearsAgo);
          
          upcomingAnniversaries.push({
            id: event.id,
            event,
            originalDate: eventDate,
            nextAnniversary,
            yearsAgo,
            daysUntil,
            milestone
          });
        }
      });

      // Sort by days until anniversary
      upcomingAnniversaries.sort((a, b) => a.daysUntil - b.daysUntil);
      
      setAnniversaries(upcomingAnniversaries);
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Career':
        return <BriefcaseIcon className="w-5 h-5" />;
      case 'Education':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'Personal':
        return <HeartIcon className="w-5 h-5" />;
      default:
        return <GiftIcon className="w-5 h-5" />;
    }
  };

  const getAnniversaryMessage = (anniversary: Anniversary) => {
    const { yearsAgo, event } = anniversary;
    
    if (anniversary.milestone) {
      return `🎉 ${yearsAgo} year milestone!`;
    }
    
    if (yearsAgo === 1) {
      return `1st anniversary`;
    } else if (yearsAgo === 2) {
      return `2nd anniversary`;
    } else if (yearsAgo === 3) {
      return `3rd anniversary`;
    } else {
      return `${yearsAgo}th anniversary`;
    }
  };

  const getDaysMessage = (daysUntil: number) => {
    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} days`;
    if (daysUntil <= 14) return `In ${Math.ceil(daysUntil / 7)} week${Math.ceil(daysUntil / 7) > 1 ? 's' : ''}`;
    return `In ${Math.ceil(daysUntil / 7)} weeks`;
  };

  const dismissReminder = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const visibleAnniversaries = anniversaries
    .filter(anniversary => !dismissedIds.includes(anniversary.id))
    .slice(0, showAll ? undefined : 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading anniversaries...</span>
      </div>
    );
  }

  if (visibleAnniversaries.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BellIcon className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">
            Upcoming Anniversaries
          </h3>
        </div>
        {anniversaries.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            {showAll ? 'Show Less' : `Show All (${anniversaries.length})`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {visibleAnniversaries.map((anniversary) => (
            <motion.div
              key={anniversary.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`
                p-4 rounded-lg border-l-4 bg-white shadow-sm
                ${anniversary.milestone 
                  ? 'border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' 
                  : anniversary.daysUntil <= 7
                    ? 'border-l-red-400 bg-red-50'
                    : 'border-l-purple-400'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${anniversary.milestone 
                      ? 'bg-yellow-100 text-yellow-700'
                      : anniversary.daysUntil <= 7
                        ? 'bg-red-100 text-red-700'
                        : 'bg-purple-100 text-purple-700'
                    }
                  `}>
                    {getCategoryIcon(anniversary.event.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {anniversary.event.title}
                      </h4>
                      {anniversary.milestone && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                          Milestone
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {getAnniversaryMessage(anniversary)} • {getDaysMessage(anniversary.daysUntil)}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <CalendarDaysIcon className="w-3 h-3 mr-1" />
                        {anniversary.originalDate.toLocaleDateString()}
                      </span>
                      <span>
                        {anniversary.nextAnniversary.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => dismissReminder(anniversary.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleAnniversaries.some(a => a.milestone) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🎉 <strong>Milestone anniversaries</strong> are special occasions worth celebrating! 
            Consider planning something memorable for these important dates.
          </p>
        </div>
      )}
    </motion.div>
  );
}
