'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';
import { PersonalEvent } from '@/types';
import { LoadingSpinner } from './loading';

interface AIInsightsProps {
  userId: string;
}

interface InsightData {
  totalEvents: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categoryBreakdown: {
    [key: string]: number;
  };
  monthlyTrends: {
    month: string;
    positive: number;
    negative: number;
    neutral: number;
  }[];
  insights: string[];
}

export default function AIInsights({ userId }: AIInsightsProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      const supabase = createClient();
      const { data: events, error } = await supabase
        .from('personal_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;

      if (!events || events.length === 0) {
        setData({
          totalEvents: 0,
          sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
          categoryBreakdown: {},
          monthlyTrends: [],
          insights: ['Add some events to see AI-powered insights about your life patterns!']
        });
        setIsLoading(false);
        return;
      }

      // Calculate sentiment breakdown
      const sentimentBreakdown = events.reduce((acc, event) => {
        acc[event.sentiment as keyof typeof acc]++;
        return acc;
      }, { positive: 0, negative: 0, neutral: 0 });

      // Calculate category breakdown
      const categoryBreakdown = events.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Calculate monthly trends (last 12 months)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === date.getMonth() && 
                 eventDate.getFullYear() === date.getFullYear();
        });

        const monthSentiment = monthEvents.reduce((acc, event) => {
          acc[event.sentiment as keyof typeof acc]++;
          return acc;
        }, { positive: 0, negative: 0, neutral: 0 });

        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          ...monthSentiment
        });
      }

      // Generate insights
      const insights = generateInsights(events, sentimentBreakdown, categoryBreakdown);

      setData({
        totalEvents: events.length,
        sentimentBreakdown,
        categoryBreakdown,
        monthlyTrends,
        insights
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (events: PersonalEvent[], sentiment: any, categories: any): string[] => {
    const insights = [];

    // Sentiment insights
    const totalEvents = events.length;
    const positivePercentage = Math.round((sentiment.positive / totalEvents) * 100);
    const negativePercentage = Math.round((sentiment.negative / totalEvents) * 100);

    if (positivePercentage > 60) {
      insights.push(`🌟 You have a very positive outlook! ${positivePercentage}% of your recorded events are positive.`);
    } else if (positivePercentage < 30) {
      insights.push(`💪 Consider focusing on positive moments - only ${positivePercentage}% of your events are positive.`);
    }

    // Category insights
    const topCategory = Object.entries(categories).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    if (topCategory) {
      insights.push(`📊 Your most active life area is ${topCategory[0]} with ${topCategory[1]} events recorded.`);
    }

    // Time-based insights
    const recentEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return eventDate >= threeMonthsAgo;
    });

    if (recentEvents.length > 0) {
      const recentPositive = recentEvents.filter(e => e.sentiment === 'positive').length;
      const recentPositivePercentage = Math.round((recentPositive / recentEvents.length) * 100);
      
      if (recentPositivePercentage > positivePercentage) {
        insights.push(`📈 Things are looking up! Your recent events are ${recentPositivePercentage}% positive, higher than your overall average.`);
      } else if (recentPositivePercentage < positivePercentage - 10) {
        insights.push(`🤗 Recent times have been challenging, but remember your overall journey is ${positivePercentage}% positive.`);
      }
    }

    // Growth insights
    if (totalEvents >= 10) {
      insights.push(`🎯 You've recorded ${totalEvents} life events! This shows great self-awareness and reflection.`);
    }

    return insights.length > 0 ? insights : ['Keep adding events to unlock more personalized insights!'];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
        <p className="text-gray-600">Add some events to see AI-powered insights</p>
      </div>
    );
  }

  const sentimentPercentages = {
    positive: Math.round((data.sentimentBreakdown.positive / data.totalEvents) * 100),
    negative: Math.round((data.sentimentBreakdown.negative / data.totalEvents) * 100),
    neutral: Math.round((data.sentimentBreakdown.neutral / data.totalEvents) * 100),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
        <p className="text-gray-600">Discover patterns and connections in your life journey</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <CalendarDaysIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{data.totalEvents}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <HeartIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{sentimentPercentages.positive}%</div>
          <div className="text-sm text-gray-600">Positive Events</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <ArrowTrendingUpIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{sentimentPercentages.neutral}%</div>
          <div className="text-sm text-gray-600">Neutral Events</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <ArrowTrendingDownIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{sentimentPercentages.negative}%</div>
          <div className="text-sm text-gray-600">Challenging Events</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Sentiment Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Positive Events</span>
              <span className="font-semibold text-green-600">{data.sentimentBreakdown.positive}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${sentimentPercentages.positive}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Neutral Events</span>
              <span className="font-semibold text-blue-600">{data.sentimentBreakdown.neutral}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${sentimentPercentages.neutral}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Challenging Events</span>
              <span className="font-semibold text-red-600">{data.sentimentBreakdown.negative}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${sentimentPercentages.negative}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Life Areas
          </h3>
          <div className="space-y-3">
            {Object.entries(data.categoryBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([category, count]) => {
                const percentage = Math.round((count as number / data.totalEvents) * 100);
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-600">{category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{percentage}%</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2" />
          AI-Powered Insights
        </h3>
        <div className="space-y-3">
          {data.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-3 bg-primary-50 border border-primary-100 rounded-lg"
            >
              <p className="text-gray-700">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
