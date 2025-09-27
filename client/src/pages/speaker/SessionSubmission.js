import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { sessionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SessionSubmission = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();
  
  const watchAbstract = watch('abstract', '');
  const abstractLength = watchAbstract?.length || 0;

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      await sessionAPI.submit(data);
      toast.success('Session submitted successfully!');
      navigate('/speaker/sessions');
    } catch (error) {
      const message = error.response?.data?.message || 'Session submission failed';
      toast.error(message);
      console.error('Session submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tracks = [
    'Track 1 - Technology Innovation',
    'Track 2 - Digital Transformation',
    'Track 3 - AI & Machine Learning',
    'Track 4 - Cloud & DevOps',
    'Track 5 - Data & Analytics'
  ];

  const categories = [
    'Master Class',
    'Demo Pod',
    'Talk',
    'Workshop',
    'Panel Discussion',
    'Lightning Talk'
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
    { value: 120, label: '2 hours' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-primary-100 p-2 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submit New Session</h1>
            <p className="text-gray-600">Propose your session for Vibeathon 2025</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">Session Title *</label>
                <input
                  type="text"
                  {...register('title', { 
                    required: 'Session title is required',
                    minLength: {
                      value: 5,
                      message: 'Title must be at least 5 characters'
                    },
                    maxLength: {
                      value: 200,
                      message: 'Title must be less than 200 characters'
                    }
                  })}
                  className="form-input"
                  placeholder="Enter a compelling session title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="form-label">
                  Abstract * 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({abstractLength}/2000 characters)
                  </span>
                </label>
                <textarea
                  {...register('abstract', { 
                    required: 'Abstract is required',
                    minLength: {
                      value: 50,
                      message: 'Abstract must be at least 50 characters'
                    },
                    maxLength: {
                      value: 2000,
                      message: 'Abstract must be less than 2000 characters'
                    }
                  })}
                  rows={6}
                  className="form-input"
                  placeholder="Provide a detailed description of your session. Include key topics, learning objectives, and what attendees will gain..."
                />
                {errors.abstract && <p className="text-red-500 text-sm mt-1">{errors.abstract.message}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Provide a comprehensive overview of your session content, key takeaways, and target audience.
                </p>
              </div>
            </div>
          </div>

          {/* Session Configuration */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Category *</label>
                <select
                  {...register('category', { required: 'Please select a category' })}
                  className="form-input"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Preferred Track *</label>
                <select
                  {...register('track', { required: 'Please select a track' })}
                  className="form-input"
                >
                  <option value="">Select track</option>
                  {tracks.map(track => (
                    <option key={track} value={track}>{track}</option>
                  ))}
                </select>
                {errors.track && <p className="text-red-500 text-sm mt-1">{errors.track.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Duration *</label>
                <select
                  {...register('duration', { 
                    required: 'Please select duration',
                    valueAsNumber: true
                  })}
                  className="form-input"
                >
                  <option value="">Select duration</option>
                  {durations.map(duration => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">Co-Speaker (Optional)</label>
                <input
                  type="text"
                  {...register('coSpeaker')}
                  className="form-input"
                  placeholder="Name of co-speaker if presenting together"
                />
              </div>
              
              <div>
                <label className="form-label">Target Audience</label>
                <input
                  type="text"
                  {...register('targetAudience')}
                  className="form-input"
                  placeholder="e.g., Developers, Architects, Business Leaders, Beginners"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Who would benefit most from attending this session?
                </p>
              </div>
              
              <div>
                <label className="form-label">Technical Requirements</label>
                <textarea
                  {...register('requirements')}
                  rows={3}
                  className="form-input"
                  placeholder="Any specific technical requirements for your session (e.g., projector, microphone, live demo setup, internet connection)"
                />
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Sessions can be edited until 1 week before the event</li>
              <li>• All submissions will be reviewed by our program committee</li>
              <li>• You'll receive an email notification about the review status</li>
              <li>• Selected speakers will be contacted for further coordination</li>
              <li>• Change requests can be submitted after initial review if needed</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/speaker/sessions')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="loading-spinner mr-2" />
              ) : (
                <PlusIcon className="h-5 w-5 mr-2" />
              )}
              Submit Session
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SessionSubmission;