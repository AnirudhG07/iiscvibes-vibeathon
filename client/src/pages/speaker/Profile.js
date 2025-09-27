import React from 'react';
import { motion } from 'framer-motion';

const Profile = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Speaker Profile</h1>
        <p className="text-gray-600">Profile management functionality coming soon...</p>
      </div>
    </motion.div>
  );
};

export default Profile;