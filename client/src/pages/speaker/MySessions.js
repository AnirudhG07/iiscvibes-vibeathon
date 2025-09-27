import React from 'react';
import { motion } from 'framer-motion';

const MySessions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Sessions</h1>
        <p className="text-gray-600">Session management functionality coming soon...</p>
      </div>
    </motion.div>
  );
};

export default MySessions;