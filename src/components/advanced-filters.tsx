'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  XMarkIcon,
  CalendarDaysIcon,
  TagIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export interface FilterOptions {
  categories: string[];
  sentiments: string[];
  dateRange: {
    start: string;
    end: string;
  };
  searchTerm: string;
  sortBy: 'date' | 'category' | 'sentiment';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  availableCategories,
  isVisible,
  onToggle
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const sentimentOptions = [
    { value: 'positive', label: 'Positive', icon: FaceSmileIcon, color: 'text-green-600' },
    { value: 'neutral', label: 'Neutral', icon: MinusIcon, color: 'text-blue-600' },
    { value: 'negative', label: 'Negative', icon: FaceFrownIcon, color: 'text-red-600' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'category', label: 'Category' },
    { value: 'sentiment', label: 'Sentiment' }
  ];

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updated = { ...localFilters, ...newFilters };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const toggleCategory = (category: string) => {
    const categories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    updateFilters({ categories });
  };

  const toggleSentiment = (sentiment: string) => {
    const sentiments = localFilters.sentiments.includes(sentiment)
      ? localFilters.sentiments.filter(s => s !== sentiment)
      : [...localFilters.sentiments, sentiment];
    updateFilters({ sentiments });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      categories: [],
      sentiments: [],
      dateRange: { start: '', end: '' },
      searchTerm: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    localFilters.categories.length > 0 ||
    localFilters.sentiments.length > 0 ||
    localFilters.dateRange.start ||
    localFilters.dateRange.end ||
    localFilters.searchTerm;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Career': 'bg-blue-100 text-blue-800 border-blue-200',
      'Education': 'bg-purple-100 text-purple-800 border-purple-200',
      'Personal': 'bg-green-100 text-green-800 border-green-200',
      'Travel': 'bg-orange-100 text-orange-800 border-orange-200',
      'Health': 'bg-red-100 text-red-800 border-red-200',
      'Finance': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
          ${hasActiveFilters 
            ? 'bg-blue-50 border-blue-300 text-blue-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <FunnelIcon className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {[
              ...localFilters.categories,
              ...localFilters.sentiments,
              localFilters.searchTerm ? 'search' : null,
              localFilters.dateRange.start ? 'date' : null
            ].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                Advanced Filters
              </h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onToggle}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <input
                  type="text"
                  value={localFilters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  placeholder="Search titles and descriptions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={localFilters.dateRange.start}
                    onChange={(e) => updateFilters({ 
                      dateRange: { ...localFilters.dateRange, start: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={localFilters.dateRange.end}
                    onChange={(e) => updateFilters({ 
                      dateRange: { ...localFilters.dateRange, end: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="w-4 h-4 inline mr-1" />
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`
                        px-3 py-1 text-sm rounded-full border transition-colors
                        ${localFilters.categories.includes(category)
                          ? getCategoryColor(category)
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sentiment
                </label>
                <div className="flex space-x-2">
                  {sentimentOptions.map(sentiment => {
                    const Icon = sentiment.icon;
                    const isSelected = localFilters.sentiments.includes(sentiment.value);
                    
                    return (
                      <button
                        key={sentiment.value}
                        onClick={() => toggleSentiment(sentiment.value)}
                        className={`
                          flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors
                          ${isSelected
                            ? `bg-${sentiment.value === 'positive' ? 'green' : sentiment.value === 'negative' ? 'red' : 'blue'}-50 border-${sentiment.value === 'positive' ? 'green' : sentiment.value === 'negative' ? 'red' : 'blue'}-300 ${sentiment.color}`
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{sentiment.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={localFilters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={localFilters.sortOrder}
                    onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
