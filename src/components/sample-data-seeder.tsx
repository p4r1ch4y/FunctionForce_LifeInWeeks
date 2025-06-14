'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SampleDataSeederProps {
  userId: string;
  onDataSeeded?: () => void;
}

interface DataStatus {
  hasEvents: boolean;
  eventCount: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  canSeed: boolean;
}

export default function SampleDataSeeder({ userId, onDataSeeded }: SampleDataSeederProps) {
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    checkDataStatus();
  }, [userId]);

  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/seed-data');
      if (response.ok) {
        const status = await response.json();
        setDataStatus(status);
      }
    } catch (error) {
      console.error('Error checking data status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch('/api/seed-data', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        if (result.seeded) {
          toast.success(`Successfully created ${result.eventsCreated} sample events!`);
          await checkDataStatus(); // Refresh status
          onDataSeeded?.();
        } else {
          toast(result.message, { icon: 'ℹ️' });
        }
      } else {
        throw new Error(result.error || 'Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to create sample data');
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Checking data status...</span>
      </div>
    );
  }

  if (!dataStatus) {
    return null;
  }

  if (dataStatus.hasEvents) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Data Ready!
            </h3>
            <p className="text-sm text-green-700">
              You have {dataStatus.eventCount} events in your timeline
              ({dataStatus.sentimentBreakdown.positive} positive, {dataStatus.sentimentBreakdown.neutral} neutral, {dataStatus.sentimentBreakdown.negative} negative)
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-6"
    >
      <div className="flex items-start">
        <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            No Events Found
          </h3>
          <p className="text-blue-700 mb-4">
            Your timeline is empty! Would you like to add some sample events to see how the application works? 
            This will create realistic life events spanning different categories and time periods.
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Sample data includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Career milestones (job changes, promotions)</li>
              <li>• Educational achievements (graduation, certifications)</li>
              <li>• Personal life events (moving, relationships, health)</li>
              <li>• Travel experiences (vacations, adventures)</li>
              <li>• Mixed sentiments (positive, negative, neutral events)</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={seedSampleData}
              disabled={isSeeding}
              className="btn-primary flex items-center justify-center"
            >
              {isSeeding ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Creating Sample Data...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Add Sample Data
                </>
              )}
            </button>
            
            <button
              onClick={() => onDataSeeded?.()}
              className="btn-secondary"
            >
              Skip for Now
            </button>
          </div>
          
          <p className="text-xs text-blue-600 mt-3">
            Don't worry - you can always add your own events manually or delete the sample data later.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
