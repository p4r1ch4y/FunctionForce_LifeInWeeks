'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { runAllTests, type TestResult, type TestSuite } from '@/lib/test-connections';

export default function TestDashboard() {
  const [testResults, setTestResults] = useState<TestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof TestSuite>('environment');

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getCategoryStats = (tests: TestResult[]) => {
    const total = tests.length;
    const success = tests.filter(t => t.status === 'success').length;
    const warnings = tests.filter(t => t.status === 'warning').length;
    const errors = tests.filter(t => t.status === 'error').length;
    
    return { total, success, warnings, errors };
  };

  const categories = [
    { key: 'environment' as const, name: 'Environment', icon: '🔧' },
    { key: 'database' as const, name: 'Database', icon: '🗄️' },
    { key: 'ai' as const, name: 'AI Modules', icon: '🤖' },
    { key: 'integration' as const, name: 'Integration', icon: '🔗' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BeakerIcon className="w-8 h-8 mr-3 text-blue-600" />
            Connection Tests
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive testing of database and AI module connections
          </p>
        </div>
        
        <button
          onClick={runTests}
          disabled={isRunning}
          className="btn-primary flex items-center"
        >
          {isRunning ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Running Tests</h3>
          <p className="text-gray-600">Testing all connections and modules...</p>
        </motion.div>
      )}

      {/* Results */}
      {testResults && !isRunning && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {categories.map((category) => {
                const stats = getCategoryStats(testResults[category.key]);
                const isActive = selectedCategory === category.key;
                
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${isActive 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${stats.errors > 0 
                        ? 'bg-red-100 text-red-800' 
                        : stats.warnings > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }
                    `}>
                      {stats.success}/{stats.total}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Test Results */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {testResults[selectedCategory].map((test, index) => (
                <motion.div
                  key={`${selectedCategory}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <h3 className="font-medium">{test.name}</h3>
                        <p className="text-sm mt-1">{test.message}</p>
                        
                        {test.duration && (
                          <div className="flex items-center mt-2 text-xs opacity-75">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {test.duration}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  {test.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-medium opacity-75 hover:opacity-100">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const stats = getCategoryStats(testResults[category.key]);
                return (
                  <div key={category.key} className="text-center">
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">
                      {stats.success}/{stats.total} passed
                    </div>
                    {stats.errors > 0 && (
                      <div className="text-xs text-red-600">
                        {stats.errors} errors
                      </div>
                    )}
                    {stats.warnings > 0 && (
                      <div className="text-xs text-yellow-600">
                        {stats.warnings} warnings
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
