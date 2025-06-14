'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface HistoricalEventsPopulatorProps {
  onPopulated?: () => void;
}

interface HistoricalStatus {
  count: number;
  hasEvents: boolean;
  message: string;
}

export default function HistoricalEventsPopulator({ onPopulated }: HistoricalEventsPopulatorProps) {
  const [status, setStatus] = useState<HistoricalStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    checkHistoricalEventsStatus();
  }, []);

  const checkHistoricalEventsStatus = async () => {
    try {
      const response = await fetch('/api/populate-historical');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error checking historical events status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const populateHistoricalEvents = async () => {
    setIsPopulating(true);
    try {
      const response = await fetch('/api/populate-historical', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          toast.success(`Successfully populated ${result.count} historical events!`);
          await checkHistoricalEventsStatus(); // Refresh status
          onPopulated?.();
        } else {
          toast(result.message, { icon: 'ℹ️' });
        }
      } else {
        throw new Error(result.error || 'Failed to populate events');
      }
    } catch (error) {
      console.error('Error populating historical events:', error);
      toast.error('Failed to populate historical events');
    } finally {
      setIsPopulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Checking historical events...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.hasEvents) {
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
              Historical Events Ready!
            </h3>
            <p className="text-sm text-green-700">
              {status.message} - Timeline will show historical context for your life events
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
            Enhance Your Timeline with Historical Context
          </h3>
          <p className="text-blue-700 mb-4">
            Add historical events to your timeline to see what was happening in the world during important moments in your life. 
            This will populate your database with major historical events from the past 50+ years.
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Historical events include:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 🔬 <strong>Science & Technology:</strong> iPhone launch, Moon landing, Internet creation</li>
              <li>• 🌍 <strong>Global Events:</strong> 9/11, Berlin Wall fall, COVID-19 pandemic</li>
              <li>• 💰 <strong>Economics:</strong> Financial crises, Bitcoin creation, major market events</li>
              <li>• 🏥 <strong>Health:</strong> Medical breakthroughs, pandemic declarations, vaccine discoveries</li>
              <li>• 🎨 <strong>Culture:</strong> Woodstock, Star Wars premiere, MTV launch</li>
              <li>• 🏆 <strong>Sports:</strong> Olympic moments, World Cup victories, historic achievements</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={populateHistoricalEvents}
              disabled={isPopulating}
              className="btn-primary flex items-center justify-center"
            >
              {isPopulating ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Populating Events...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Add Historical Events
                </>
              )}
            </button>
            
            <button
              onClick={() => onPopulated?.()}
              className="btn-secondary"
            >
              Skip for Now
            </button>
          </div>
          
          <p className="text-xs text-blue-600 mt-3">
            This will add ~40 major historical events to your database. You can always add more later.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
