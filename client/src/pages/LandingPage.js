import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Calendar,
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  MessageSquare,
  QrCode,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: 'Session Management',
      description: 'Submit, edit, and manage your session proposals with ease. Track submission status in real-time.',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: Calendar,
      title: 'Dynamic Agenda',
      description: 'View the published event schedule with session details, timing, and venue information.',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: QrCode,
      title: 'QR Code System',
      description: 'Generate unique QR codes for check-in, t-shirt collection, and event day management.',
      color: 'from-purple-600 to-purple-700'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Communication',
      description: 'Automated email notifications and in-app messaging for seamless coordination.',
      color: 'from-orange-600 to-orange-700'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and feedback analytics for event organizers and speakers.',
      color: 'from-red-600 to-red-700'
    },
    {
      icon: Settings,
      title: 'Event Management',
      description: 'Complete admin tools for session review, agenda building, and speaker coordination.',
      color: 'from-indigo-600 to-indigo-700'
    }
  ];

  const stats = [
    { label: 'Active Speakers', value: '1000+', icon: Users },
    { label: 'Sessions Managed', value: '500+', icon: Calendar },
    { label: 'Events Supported', value: '50+', icon: Award },
    { label: 'Success Rate', value: '99%', icon: Star }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                Transform Your
                <span className="gradient-text block">Event Experience</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                The ultimate speaker persona app designed for modern events. Streamline session management, 
                enhance speaker engagement, and deliver exceptional event experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Get Started as Speaker
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/feedback" className="btn-secondary text-lg px-8 py-4">
                  Provide Feedback
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <span className="gradient-text"> Successful Events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to handle every aspect of speaker and event management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card hover:shadow-strong transition-all duration-300 group"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple Process, <span className="gradient-text">Powerful Results</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From registration to event day, we've streamlined every step of the speaker journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', description: 'Create your speaker profile with session details and preferences.' },
              { step: '02', title: 'Submit', description: 'Propose your sessions with detailed abstracts and requirements.' },
              { step: '03', title: 'Prepare', description: 'Get approved, upload materials, and coordinate with organizers.' },
              { step: '04', title: 'Present', description: 'Use QR codes for check-in and deliver amazing sessions.' }
            ].map((process, index) => (
              <motion.div
                key={process.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full text-white font-bold text-lg mb-4">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.title}</h3>
                  <p className="text-gray-600">{process.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-blue-200 transform translate-x-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Elevate Your Speaking Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of speakers who trust our platform for their event management needs. 
              Get started today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Link>
              <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
                Already Registered? Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;