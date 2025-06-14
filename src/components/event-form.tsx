'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
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
      
      const eventData = {
        title,
        description,
        date,
        category,
        user_id: userId,
      };

      if (event) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('personal_events')
          .update(eventData)
          .eq('id', event.id);

        if (updateError) throw updateError;
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('personal_events')
          .insert([eventData]);

        if (insertError) throw insertError;
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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