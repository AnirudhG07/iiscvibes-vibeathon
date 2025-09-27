import React from 'react';
import { motion } from 'framer-motion';

const SessionReview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Review</h1>
        <p className="text-gray-600">Session review functionality coming soon...</p>
      </div>
    </motion.div>
  );
};

export default SessionReview;