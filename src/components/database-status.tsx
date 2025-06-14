'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';

interface DatabaseStatusProps {
  userId: string;
}

interface DatabaseStatus {
  userExists: boolean;
  tablesExist: boolean;
  canInsert: boolean;
  eventCount: number;
  error?: string;
}

export default function DatabaseStatus({ userId }: DatabaseStatusProps) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkDatabaseStatus();
  }, [userId]);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      // Check if we can query events table
      const { data: eventsData, error: eventsError } = await supabase
        .from('personal_events')
        .select('id')
        .eq('user_id', userId);

      // Try to insert a test record (we'll delete it immediately)
      const testEvent = {
        user_id: userId,
        title: 'Test Event',
        description: 'This is a test',
        date: new Date().toISOString(),
        category: 'Personal',
        sentiment: 'neutral'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('personal_events')
        .insert([testEvent])
        .select();

      // Delete the test record if it was created
      if (insertData && insertData.length > 0) {
        await supabase
          .from('personal_events')
          .delete()
          .eq('id', insertData[0].id);
      }

      setStatus({
        userExists: !userError && !!userData,
        tablesExist: !eventsError,
        canInsert: !insertError,
        eventCount: eventsData?.length || 0,
        error: userError?.message || eventsError?.message || insertError?.message
      });

      // Only show if there are issues
      setIsVisible(!(!userError && !eventsError && !insertError));

    } catch (error) {
      console.error('Database status check failed:', error);
      setStatus({
        userExists: false,
        tablesExist: false,
        canInsert: false,
        eventCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Checking database status...</span>
      </div>
    );
  }

  if (!isVisible || !status) {
    return null;
  }

  const getStatusIcon = () => {
    if (status.userExists && status.tablesExist && status.canInsert) {
      return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
    } else if (status.tablesExist) {
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
    } else {
      return <XCircleIcon className="w-6 h-6 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (status.userExists && status.tablesExist && status.canInsert) {
      return 'bg-green-50 border-green-200';
    } else if (status.tablesExist) {
      return 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-red-50 border-red-200';
    }
  };

  const getStatusTitle = () => {
    if (status.userExists && status.tablesExist && status.canInsert) {
      return 'Database Connected';
    } else if (status.tablesExist) {
      return 'Database Issues Detected';
    } else {
      return 'Database Setup Required';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}
    >
      <div className="flex items-start">
        {getStatusIcon()}
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {getStatusTitle()}
          </h3>
          
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center">
              {status.userExists ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span>User profile: {status.userExists ? 'Found' : 'Missing'}</span>
            </div>
            
            <div className="flex items-center">
              {status.tablesExist ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span>Database tables: {status.tablesExist ? 'Accessible' : 'Missing'}</span>
            </div>
            
            <div className="flex items-center">
              {status.canInsert ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span>Write permissions: {status.canInsert ? 'Working' : 'Blocked'}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-600">Events count: {status.eventCount}</span>
            </div>
          </div>

          {status.error && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm text-red-600 font-mono">{status.error}</p>
            </div>
          )}

          {(!status.userExists || !status.tablesExist || !status.canInsert) && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Go to your Supabase project dashboard</li>
                <li>Open the SQL Editor</li>
                <li>Run the setup script from supabase-setup.sql</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={checkDatabaseStatus}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Recheck Status
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
