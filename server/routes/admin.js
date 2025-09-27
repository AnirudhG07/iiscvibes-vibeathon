const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { readJsonFile, updateInJsonFile } = require('../utils/fileUtils');
const emailService = require('../utils/emailService');

const router = express.Router();

// Get all users pending role approval
router.get('/pending-approvals', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const pendingUsers = users.filter(user => user.roleStatus === 'pending');
    
    // Remove sensitive information
    const sanitizedUsers = pendingUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({ pendingUsers: sanitizedUsers });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Failed to fetch pending approvals', error: error.message });
  }
});

// Approve/reject user role request
router.put('/approve-role/:userId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
    }
    
    const users = await readJsonFile('users.json');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.roleStatus !== 'pending') {
      return res.status(400).json({ message: 'User role is not pending approval' });
    }
    
    const updates = {
      roleStatus: action === 'approve' ? 'approved' : 'rejected',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (action === 'approve') {
      updates.role = user.requestedRole;
    } else if (reason) {
      updates.rejectionReason = reason;
    }
    
    const updatedUser = await updateInJsonFile('users.json', userId, updates);
    
    res.json({
      message: `User role ${action}d successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        roleStatus: updatedUser.roleStatus
      }
    });
  } catch (error) {
    console.error('Approve role error:', error);
    res.status(500).json({ message: 'Role approval failed', error: error.message });
  }
});

// Get admin dashboard stats
router.get('/dashboard-stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const events = await readJsonFile('events.json');
    
    let eventRegistrations = [];
    try {
      eventRegistrations = await readJsonFile('eventRegistrations.json');
    } catch (error) {
      // File doesn't exist yet
    }
    
    const stats = {
      totalUsers: users.length,
      pendingApprovals: users.filter(u => u.roleStatus === 'pending').length,
      totalSpeakers: users.filter(u => u.role === 'speaker').length,
      totalOrganizers: users.filter(u => u.role === 'organizer').length,
      totalEvents: events.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      totalRegistrations: eventRegistrations.length
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

module.exports = router;