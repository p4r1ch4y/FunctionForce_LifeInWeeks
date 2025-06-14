'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PaintBrushIcon, 
  SparklesIcon, 
  CalendarDaysIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';
import { PersonalEvent, LifeChapter } from '@/types';
import { LoadingSpinner } from './loading';
import toast from 'react-hot-toast';

interface LifeChaptersProps {
  userId: string;
}

const LIFE_STAGES = [
  { name: 'Early Childhood', startAge: 0, endAge: 5, color: 'from-pink-400 to-rose-400' },
  { name: 'Childhood', startAge: 6, endAge: 12, color: 'from-blue-400 to-cyan-400' },
  { name: 'Adolescence', startAge: 13, endAge: 19, color: 'from-purple-400 to-indigo-400' },
  { name: 'Young Adult', startAge: 20, endAge: 29, color: 'from-green-400 to-emerald-400' },
  { name: 'Early Career', startAge: 30, endAge: 39, color: 'from-orange-400 to-amber-400' },
  { name: 'Mid-Life', startAge: 40, endAge: 54, color: 'from-red-400 to-pink-400' },
  { name: 'Mature Years', startAge: 55, endAge: 69, color: 'from-teal-400 to-cyan-400' },
  { name: 'Golden Years', startAge: 70, endAge: 100, color: 'from-yellow-400 to-orange-400' },
];

export default function LifeChapters({ userId }: LifeChaptersProps) {
  const [chapters, setChapters] = useState<LifeChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingArt, setGeneratingArt] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<LifeChapter | null>(null);
  const [userBirthdate, setUserBirthdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchChapters();
  }, [userId]);

  const fetchChapters = async () => {
    try {
      const supabase = createClient();
      
      // Get user birthdate
      const { data: userData } = await supabase
        .from('users')
        .select('birthdate')
        .eq('id', userId)
        .single();

      const birthdate = userData?.birthdate ? new Date(userData.birthdate) : new Date('1990-01-01');
      setUserBirthdate(birthdate);

      // Get all events
      const { data: events, error } = await supabase
        .from('personal_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;

      // Calculate current age
      const currentAge = Math.floor((Date.now() - birthdate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      // Create chapters based on life stages and events
      const lifeChapters: LifeChapter[] = LIFE_STAGES
        .filter(stage => stage.startAge <= currentAge + 5) // Include future stages up to 5 years
        .map(stage => {
          const chapterEvents = (events || []).filter(event => {
            const eventDate = new Date(event.date);
            const eventAge = Math.floor((eventDate.getTime() - birthdate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            return eventAge >= stage.startAge && eventAge <= stage.endAge;
          });

          return {
            name: stage.name,
            startAge: stage.startAge,
            endAge: stage.endAge,
            events: chapterEvents,
            color: stage.color,
          };
        });

      setChapters(lifeChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to load life chapters');
    } finally {
      setIsLoading(false);
    }
  };

  const generateArtForChapter = async (chapter: LifeChapter) => {
    if (chapter.events.length === 0) {
      toast.error('No events in this chapter to generate art from');
      return;
    }

    setGeneratingArt(chapter.name);

    try {
      const response = await fetch('/api/generate-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: chapter.events,
          chapterName: chapter.name,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate art');

      const data = await response.json();
      
      // Update the chapter with the generated art
      setChapters(prev => prev.map(c => 
        c.name === chapter.name 
          ? { ...c, artPrompt: data.prompt, generatedArt: data.imageUrl }
          : c
      ));

      toast.success('Art generated successfully!');
    } catch (error) {
      console.error('Error generating art:', error);
      toast.error('Failed to generate art');
    } finally {
      setGeneratingArt(null);
    }
  };

  const getChapterProgress = (chapter: LifeChapter) => {
    if (!userBirthdate) return 0;
    
    const currentAge = Math.floor((Date.now() - userBirthdate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (currentAge < chapter.startAge) return 0;
    if (currentAge > chapter.endAge) return 100;
    
    const progress = ((currentAge - chapter.startAge) / (chapter.endAge - chapter.startAge)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Life Chapters</h2>
        <p className="text-gray-600">AI-generated artwork representing different phases of your life</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters.map((chapter, index) => {
          const progress = getChapterProgress(chapter);
          const isActive = progress > 0 && progress < 100;
          const isCompleted = progress === 100;
          
          return (
            <motion.div
              key={chapter.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card hover:shadow-lg transition-all cursor-pointer ${
                isActive ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setSelectedChapter(chapter)}
            >
              {/* Art Preview */}
              <div className={`aspect-square rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br ${chapter.color} relative overflow-hidden`}>
                {chapter.generatedArt ? (
                  <img 
                    src={chapter.generatedArt} 
                    alt={`${chapter.name} artwork`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <PaintBrushIcon className="w-12 h-12 text-white/80 mx-auto mb-2" />
                    <p className="text-white/80 text-sm">No art generated</p>
                  </div>
                )}
                
                {/* Progress indicator */}
                {progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
                    <div className="h-1 bg-white/30">
                      <div 
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{chapter.name}</h3>
                  {isActive && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Complete
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  Ages {chapter.startAge}-{chapter.endAge} • {chapter.events.length} events
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChapter(chapter);
                    }}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View Details
                  </button>

                  {chapter.events.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateArtForChapter(chapter);
                      }}
                      disabled={generatingArt === chapter.name}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                    >
                      {generatingArt === chapter.name ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <SparklesIcon className="w-4 h-4 mr-1" />
                      )}
                      {chapter.generatedArt ? 'Regenerate' : 'Generate Art'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chapter Detail Modal */}
      {selectedChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedChapter.name}</h3>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {selectedChapter.generatedArt && (
                <div className="mb-6">
                  <img 
                    src={selectedChapter.generatedArt} 
                    alt={`${selectedChapter.name} artwork`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {selectedChapter.artPrompt && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      "{selectedChapter.artPrompt}"
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Chapter Overview</h4>
                  <p className="text-gray-600">
                    Ages {selectedChapter.startAge}-{selectedChapter.endAge} • {selectedChapter.events.length} events recorded
                  </p>
                </div>

                {selectedChapter.events.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Events in this Chapter</h4>
                    <div className="space-y-3">
                      {selectedChapter.events.map((event) => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-gray-900">{event.title}</h5>
                            <span className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              event.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
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
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
