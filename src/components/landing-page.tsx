'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CalendarDaysIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  PaintBrushIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Life Visualization',
    description: 'See your entire life mapped out week by week in an intuitive, interactive timeline.',
    icon: CalendarDaysIcon,
  },
  {
    name: 'AI-Powered Insights',
    description: 'Get personalized narratives connecting your life events with historical moments.',
    icon: SparklesIcon,
  },
  {
    name: 'Sentiment Analysis',
    description: 'Automatically analyze the emotional tone of your life events with advanced AI.',
    icon: ChartBarIcon,
  },
  {
    name: 'Generative Art',
    description: 'Create unique artwork representing different chapters of your life journey.',
    icon: PaintBrushIcon,
  },
];

const stats = [
  { name: 'Average Human Lifespan', value: '4,000', unit: 'weeks' },
  { name: 'Life Events Tracked', value: '10K+', unit: 'events' },
  { name: 'AI Narratives Generated', value: '50K+', unit: 'stories' },
  { name: 'User Satisfaction', value: '98%', unit: 'rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LifeWeeks</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                Your Life in{' '}
                <span className="text-gradient">4,000 Weeks</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Visualize your entire life journey week by week. Add personal milestones, 
                discover historical connections, and let AI create your unique story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                  Start Your Journey
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Timeline Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See Your Life at a Glance
            </h2>
            <p className="text-lg text-gray-600">
              Each square represents a week of your life. Color-coded by sentiment and significance.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden"
          >
            <div className="grid grid-cols-52 gap-1 max-w-4xl mx-auto">
              {Array.from({ length: 1040 }, (_, i) => (
                <motion.div
                  key={i}
                  className={`timeline-week ${
                    Math.random() > 0.7 
                      ? Math.random() > 0.5 
                        ? 'timeline-week-positive' 
                        : 'timeline-week-negative'
                      : 'timeline-week-empty'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.001 }}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-sm mr-2"></div>
                Positive Events
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-sm mr-2"></div>
                Challenging Times
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 rounded-sm mr-2"></div>
                Regular Weeks
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our intelligent system doesn't just store your memories—it helps you understand 
              and connect them in meaningful ways.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 mb-1">{stat.unit}</div>
                <div className="text-gray-300">{stat.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Map Your Life?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands who have discovered new perspectives on their life journey.
            </p>
            <Link href="/auth/signup" className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Get Started Free
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 LifeWeeks. Built with ❤️ for meaningful reflection.</p>
        </div>
      </footer>
    </div>
  );
}
