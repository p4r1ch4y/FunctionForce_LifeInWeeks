'use server';

import { createClient } from '@/lib/supabase';
import { analyzeSentiment } from '@/lib/ai';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  category: z.enum(['Career', 'Education', 'Personal', 'Travel']),
  user_id: z.string().uuid(),
});

export async function createEvent(formData: FormData) {
  const supabase = createClient();
  
  try {
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      category: formData.get('category'),
      user_id: formData.get('user_id'),
    };

    const validatedData = eventSchema.parse(rawData);
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(validatedData.description);
    
    // Create event with sentiment
    const { error } = await supabase
      .from('personal_events')
      .insert([
        {
          ...validatedData,
          sentiment,
        },
      ]);

    if (error) throw error;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEvent(formData: FormData) {
  const supabase = createClient();
  
  try {
    const rawData = {
      id: formData.get('id'),
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      category: formData.get('category'),
      user_id: formData.get('user_id'),
    };

    const validatedData = eventSchema.parse(rawData);
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(validatedData.description);
    
    // Update event with sentiment
    const { error } = await supabase
      .from('personal_events')
      .update({
        ...validatedData,
        sentiment,
      })
      .eq('id', formData.get('id'))
      .eq('user_id', validatedData.user_id);

    if (error) throw error;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(eventId: string, userId: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('personal_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete event' };
  }
} 