'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  ChartBarIcon, 
  PaintBrushIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import TimelineView from './timeline-view';
import AdvancedTimeline from './advanced-timeline';
import EventForm from './event-form';
import EventManager from './event-manager';
import LifeChapters from './life-chapters';
import AIInsights from './ai-insights';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface DashboardProps {
  userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'events' | 'chapters' | 'insights'>('timeline');
  const [showEventForm, setShowEventForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    toast.success('Signed out successfully');
  };

  const tabs = [
    { id: 'timeline', name: 'Timeline', icon: CalendarDaysIcon },
    { id: 'events', name: 'Events', icon: PlusIcon },
    { id: 'chapters', name: 'Life Chapters', icon: PaintBrushIcon },
    { id: 'insights', name: 'AI Insights', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LifeWeeks</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEventForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Event
              </button>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Life Timeline</h2>
                  <p className="text-gray-600">Each square represents a week of your life</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-sm mr-2"></div>
                    Positive
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-sm mr-2"></div>
                    Negative
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-sm mr-2"></div>
                    Neutral
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded-sm mr-2"></div>
                    Empty
                  </div>
                </div>
              </div>
              <AdvancedTimeline userId={userId} />
            </div>
          )}

          {activeTab === 'events' && (
            <EventManager userId={userId} />
          )}

          {activeTab === 'chapters' && (
            <LifeChapters userId={userId} />
          )}

          {activeTab === 'insights' && (
            <AIInsights userId={userId} />
          )}
        </motion.div>
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Event</h3>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <EventForm 
              userId={userId} 
              onSuccess={() => {
                toast.success('Event added successfully!');
                setShowEventForm(false);
              }} 
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
