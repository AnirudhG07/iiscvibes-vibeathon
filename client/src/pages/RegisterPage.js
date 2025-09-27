import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, Sparkles, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();
  
  const watchSpeaker2Email = watch('speaker2Email');

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Clean up optional fields
      const cleanData = {
        ...data,
        speaker2Name: data.speaker2Name || '',
        speaker2Email: data.speaker2Email || '',
        speaker2TshirtSize: data.speaker2TshirtSize || '',
        bloodGroup: data.bloodGroup || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactNumber: data.emergencyContactNumber || '',
        linkedinProfile: data.linkedinProfile || '',
        sapCommunityUrl: data.sapCommunityUrl || ''
      };
      
      const result = await authRegister(cleanData);
      if (result.success) {
        navigate('/speaker', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
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

  const sessionCategories = [
    'Master Class',
    'Demo Pod',
    'Talk',
    'Workshop',
    'Panel Discussion',
    'Lightning Talk'
  ];

  const tshirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join as a Speaker
          </h2>
          <p className="mt-2 text-gray-600">
            Register for Vibeathon 2025 and share your expertise
          </p>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Full name is required' })}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    {...register('mobile', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit mobile number'
                      }
                    })}
                    className="form-input"
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                </div>
                
                <div className="relative">
                  <label className="form-label">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="form-input pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center top-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
              </div>
            </div>
            
            {/* Session Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Preferred Track *</label>
                  <select
                    {...register('track', { required: 'Please select a track' })}
                    className="form-input"
                  >
                    <option value="">Select a track</option>
                    {tracks.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                  {errors.track && <p className="text-red-500 text-sm mt-1">{errors.track.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Session Category *</label>
                  <select
                    {...register('sessionCategory', { required: 'Please select a category' })}
                    className="form-input"
                  >
                    <option value="">Select category</option>
                    {sessionCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.sessionCategory && <p className="text-red-500 text-sm mt-1">{errors.sessionCategory.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">T-shirt Size *</label>
                  <select
                    {...register('tshirtSize', { required: 'Please select t-shirt size' })}
                    className="form-input"
                  >
                    <option value="">Select size</option>
                    {tshirtSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  {errors.tshirtSize && <p className="text-red-500 text-sm mt-1">{errors.tshirtSize.message}</p>}
                </div>
              </div>
            </div>
            
            {/* Co-Speaker Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Co-Speaker Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Co-Speaker Name</label>
                  <input
                    type="text"
                    {...register('speaker2Name')}
                    className="form-input"
                    placeholder="Co-speaker name"
                  />
                </div>
                
                <div>
                  <label className="form-label">Co-Speaker Email</label>
                  <input
                    type="email"
                    {...register('speaker2Email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="form-input"
                    placeholder="Co-speaker email"
                  />
                  {errors.speaker2Email && <p className="text-red-500 text-sm mt-1">{errors.speaker2Email.message}</p>}
                </div>
                
                {watchSpeaker2Email && (
                  <div>
                    <label className="form-label">Co-Speaker T-shirt Size</label>
                    <select
                      {...register('speaker2TshirtSize')}
                      className="form-input"
                    >
                      <option value="">Select size</option>
                      {tshirtSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Food Choice *</label>
                  <select
                    {...register('foodChoice', { required: 'Please select food preference' })}
                    className="form-input"
                  >
                    <option value="">Select preference</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                  {errors.foodChoice && <p className="text-red-500 text-sm mt-1">{errors.foodChoice.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    {...register('bloodGroup')}
                    className="form-input"
                    placeholder="e.g., A+, B-, O+"
                  />
                </div>
                
                <div>
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    {...register('emergencyContactName')}
                    className="form-input"
                    placeholder="Emergency contact name"
                  />
                </div>
                
                <div>
                  <label className="form-label">Emergency Contact Number</label>
                  <input
                    type="tel"
                    {...register('emergencyContactNumber')}
                    className="form-input"
                    placeholder="Emergency contact number"
                  />
                </div>
                
                <div>
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    {...register('linkedinProfile')}
                    className="form-input"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="form-label">SAP Community URL</label>
                  <input
                    type="url"
                    {...register('sapCommunityUrl')}
                    className="form-input"
                    placeholder="https://community.sap.com/yourprofile"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('agreeTerms', { required: 'Please agree to terms and conditions' })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms.message}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center text-lg py-4"
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                'Register as Speaker'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;