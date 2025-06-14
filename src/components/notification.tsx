'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Notification({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationProps) {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const Icon = icons[type];

  // Auto close functionality
  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg p-4 ${colors[type]}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`w-5 h-5 ${iconColors[type]}`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">{title}</h3>
              {message && (
                <p className="mt-1 text-sm opacity-90">{message}</p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing notifications
export function useNotification() {
  const [notifications, setNotifications] = React.useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>>([]);

  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success: (title: string, message?: string) => addNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) => addNotification({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addNotification({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addNotification({ type: 'info', title, message }),
  };
}
