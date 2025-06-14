'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarDaysIcon,
  TagIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';
import { PersonalEvent } from '@/types';
import EventForm from './event-form';
import { LoadingSpinner } from './loading';
import toast from 'react-hot-toast';

interface EventManagerProps {
  userId: string;
}

export default function EventManager({ userId }: EventManagerProps) {
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('personal_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('personal_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <FaceSmileIcon className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <FaceFrownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <HeartIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career':
        return 'bg-purple-100 text-purple-800';
      case 'Education':
        return 'bg-blue-100 text-blue-800';
      case 'Personal':
        return 'bg-green-100 text-green-800';
      case 'Travel':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.sentiment === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Manager</h2>
          <p className="text-gray-600">Manage your life events and memories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field py-1 text-sm"
          >
            <option value="all">All Events</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-field py-1 text-sm"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(event.sentiment)}
                  <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowForm(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getSentimentColor(event.sentiment)}`}>
                    {event.sentiment}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "You haven't added any events yet." 
              : `No ${filter} events found.`}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add Your First Event
          </button>
        </div>
      )}

      {/* Event Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <EventForm 
                userId={userId}
                event={editingEvent || undefined}
                onSuccess={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  fetchEvents();
                  toast.success(editingEvent ? 'Event updated!' : 'Event added!');
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
