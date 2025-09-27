import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Star, 
  MessageSquare, 
  Download,
  Filter,
  Calendar,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';
import { feedbackAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FeedbackAnalytics = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    fetchData();
  }, [filter, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedbackResponse, statsResponse] = await Promise.all([
        feedbackAPI.getAllFeedback({ filter, dateRange }),
        feedbackAPI.getStats()
      ]);
      
      setFeedback(feedbackResponse.data.feedback || []);
      setStats(statsResponse.data.stats || {});
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await feedbackAPI.export();
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Feedback exported successfully');
    } catch (error) {
      console.error('Error exporting feedback:', error);
      toast.error('Failed to export feedback');
    }
  };

  // Process data for charts
  const ratingDistribution = stats?.ratingDistribution || [];
  const sessionRatings = feedback.map(f => ({
    session: f.sessionTitle?.substring(0, 20) + '...' || 'Unknown',
    rating: f.rating || 0,
    responses: 1
  }));

  const averageRatings = stats?.averageRatings ? Object.entries(stats.averageRatings).map(([category, rating]) => ({
    category,
    rating: parseFloat(rating.toFixed(1))
  })) : [];

  const dailyFeedback = stats?.dailyFeedback || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze feedback and ratings from participants</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Sessions</option>
            <option value="session">Session Feedback</option>
            <option value="event">Event Feedback</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-input"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats?.totalFeedback || 0}</div>
          <div className="text-gray-600 flex items-center justify-center mt-1">
            <MessageSquare className="w-4 h-4 mr-1" />
            Total Feedback
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-600 flex items-center justify-center mt-1">
            <Star className="w-4 h-4 mr-1" />
            Average Rating
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats?.uniqueSessions || 0}</div>
          <div className="text-gray-600 flex items-center justify-center mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            Sessions Rated
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats?.responseRate ? `${stats.responseRate}%` : '0%'}
          </div>
          <div className="text-gray-600 flex items-center justify-center mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            Response Rate
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Rating Distribution
          </h2>
          <div className="space-y-3">
            {ratingDistribution.map((item, index) => (
              <div key={item.rating} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({item.rating} stars)</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="h-4 bg-blue-500 rounded mr-2" 
                    style={{ width: `${(item.count / stats?.totalFeedback * 100) || 0}px`, minWidth: '4px' }}
                  />
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Ratings by Category */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Average Ratings by Category
          </h2>
          <div className="space-y-3">
            {averageRatings.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.category}</span>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sessions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Top Rated Sessions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latest Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.sessionTitle || 'General Event Feedback'}
                    </div>
                    <div className="text-sm text-gray-500">{item.track}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.speakerName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.rating || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    1
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Comments */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Comments</h2>
        <div className="space-y-4">
          {feedback
            .filter(f => f.comments && f.comments.trim())
            .slice(0, 5)
            .map((item, index) => (
              <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                <div className="text-sm font-medium text-gray-900">
                  {item.sessionTitle || 'General Event Feedback'}
                </div>
                <p className="text-gray-600 mt-1">{item.comments}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="mr-4">{item.rating}/5</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalytics;