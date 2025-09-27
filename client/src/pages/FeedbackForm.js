import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Star, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { feedbackAPI } from '../services/api';
import toast from 'react-hot-toast';

const FeedbackForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    setLoading(true);
    
    try {
      const feedbackData = {
        ...data,
        rating,
        sessionId: 'general-feedback', // For general event feedback
        sessionTitle: 'Vibeathon 2025 - General Feedback',
        speakerName: 'Event Team',
        track: 'General',
        timeSlot: 'N/A'
      };
      
      await feedbackAPI.submit(feedbackData);
      toast.success('Thank you for your feedback!');
      setSubmitted(true);
      reset();
      setRating(0);
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-green-100 p-4 rounded-full inline-block mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-8">
            Your feedback has been submitted successfully. We appreciate your time and insights!
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            Submit Another Feedback
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-3 rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Event Feedback
          </h2>
          <p className="mt-2 text-gray-600">
            Help us improve future events with your valuable feedback
          </p>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="form-label">Overall Event Rating *</label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {rating === 0 && 'Click to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Content Quality</label>
                <select
                  {...register('contentQuality')}
                  className="form-input"
                >
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Organization</label>
                <select
                  {...register('presentationSkills')}
                  className="form-input"
                >
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Relevance</label>
                <select
                  {...register('relevance')}
                  className="form-input"
                >
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="form-label">Additional Comments</label>
              <textarea
                {...register('comments')}
                rows={4}
                className="form-input"
                placeholder="Share your detailed feedback, suggestions, or any specific comments about the event..."
              />
            </div>

            {/* Recommendation */}
            <div>
              <label className="form-label">Would you recommend this event to others?</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('recommendToOthers')}
                    value="true"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Yes, definitely</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('recommendToOthers')}
                    value="false"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">No, I wouldn't</span>
                </label>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    {...register('attendeeName')}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    {...register('attendeeEmail', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                  {errors.attendeeEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.attendeeEmail.message}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                We may use this information to follow up on your feedback or invite you to future events.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full btn-primary flex justify-center items-center text-lg py-4"
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackForm;