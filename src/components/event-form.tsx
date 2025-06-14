'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { analyzeSentiment } from '@/lib/ai';
import type { PersonalEvent } from '@/types';

interface EventFormProps {
  userId: string;
  onSuccess?: () => void;
  event?: PersonalEvent;
}

export default function EventForm({ userId, onSuccess, event }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date ? new Date(event.date).toISOString().split('T')[0] : '');
  const [category, setCategory] = useState<PersonalEvent['category']>(event?.category || 'Personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Analyze sentiment with fallback
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      try {
        sentiment = await analyzeSentiment(`${title} ${description}`);
      } catch (sentimentError) {
        console.warn('Sentiment analysis failed, using fallback:', sentimentError);
        // Use simple keyword-based fallback
        const text = `${title} ${description}`.toLowerCase();
        if (text.includes('happy') || text.includes('success') || text.includes('great') || text.includes('love') || text.includes('amazing') || text.includes('wonderful')) {
          sentiment = 'positive';
        } else if (text.includes('sad') || text.includes('fail') || text.includes('bad') || text.includes('angry') || text.includes('terrible') || text.includes('awful')) {
          sentiment = 'negative';
        }
      }

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date).toISOString(),
        category,
        sentiment,
        user_id: userId,
      };

      console.log('Submitting event data:', eventData);

      if (event) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('personal_events')
          .update(eventData)
          .eq('id', event.id)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      } else {
        // Create new event
        const { data, error: insertError } = await supabase
          .from('personal_events')
          .insert([eventData])
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        console.log('Event created:', data);
      }

      // Reset form only if creating new event
      if (!event) {
        setTitle('');
        setDescription('');
        setDate('');
        setCategory('Personal');
      }

      onSuccess?.();
    } catch (err) {
      console.error('Event submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input-field"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as PersonalEvent['category'])}
          className="input-field"
          required
        >
          <option value="Career">Career</option>
          <option value="Education">Education</option>
          <option value="Personal">Personal</option>
          <option value="Travel">Travel</option>
        </select>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Saving...' : event ? 'Update Event' : 'Add Event'}
      </button>
    </form>
  );
} 