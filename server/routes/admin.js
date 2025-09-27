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
    let eventApplications = [];
    try {
      eventRegistrations = await readJsonFile('eventRegistrations.json');
    } catch (error) {
      // File doesn't exist yet
    }
    
    try {
      eventApplications = await readJsonFile('eventApplications.json');
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
      totalRegistrations: eventRegistrations.length,
      pendingApplications: eventApplications.filter(app => app.status === 'pending').length
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// Generate QR code for user (admin only)
router.post('/generate-qr/:userId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { eventId } = req.body;

    const users = await readJsonFile('users.json');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const QRCode = require('qrcode');
    
    // Generate QR code data
    const qrData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      eventId: eventId || 'all-events',
      generatedAt: new Date().toISOString(),
      type: 'user-checkin'
    };

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    
    // Update user's QR status
    await updateInJsonFile('users.json', userId, {
      qrCodeGenerated: true,
      lastQrGenerated: new Date().toISOString()
    });

    res.json({
      message: 'QR code generated successfully',
      qrCode: qrCodeImage,
      qrData
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ message: 'QR generation failed', error: error.message });
  }
});

// Scan QR code (admin only)
router.post('/scan-qr', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { qrData } = req.body;
    
    let parsedQrData;
    try {
      parsedQrData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { userId, eventId, type } = parsedQrData;
    
    // Find user
    const users = await readJsonFile('users.json');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record scan
    let qrScans = [];
    try {
      qrScans = await readJsonFile('qrScans.json');
    } catch (error) {
      // File doesn't exist yet
    }

    const scan = {
      userId,
      eventId: eventId || 'general',
      scannedBy: req.user.id,
      scannedAt: new Date().toISOString(),
      type,
      location: req.body.location || 'event-venue'
    };

    qrScans.push(scan);

    // Save scan record
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.join(__dirname, '../data/qrScans.json'),
      JSON.stringify(qrScans, null, 2)
    );

    // Update user check-in status
    const updates = {
      checkedIn: true,
      lastCheckedIn: new Date().toISOString()
    };

    if (type === 'tshirt-collection') {
      updates.tshirtCollected = true;
    }

    await updateInJsonFile('users.json', userId, updates);

    res.json({
      message: 'QR code scanned successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      scan
    });
  } catch (error) {
    console.error('Scan QR error:', error);
    res.status(500).json({ message: 'QR scan failed', error: error.message });
  }
});

// Get QR scan history (admin only)
router.get('/qr-scans', auth, requireRole(['admin']), async (req, res) => {
  try {
    let qrScans = [];
    try {
      qrScans = await readJsonFile('qrScans.json');
    } catch (error) {
      // File doesn't exist yet
    }

    const users = await readJsonFile('users.json');
    
    // Add user details to scans
    const scansWithUsers = qrScans.map(scan => {
      const user = users.find(u => u.id === scan.userId);
      return {
        ...scan,
        user: user ? {
          name: user.name,
          email: user.email,
          role: user.role
        } : null
      };
    });

    res.json({ scans: scansWithUsers });
  } catch (error) {
    console.error('Get QR scans error:', error);
    res.status(500).json({ message: 'Failed to fetch QR scans', error: error.message });
  }
});

// User Management
// Get all users
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    // Don't send passwords
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Approve user
router.put('/users/:userId/approve', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await readJsonFile('users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      roleStatus: 'approved',
      role: users[userIndex].requestedRole || users[userIndex].role,
      approvedBy: req.user.userId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeJsonFile('users.json', users);
    
    const { password, ...safeUser } = users[userIndex];
    res.json({ message: 'User approved successfully', user: safeUser });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Failed to approve user' });
  }
});

// Reject user
router.put('/users/:userId/reject', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await readJsonFile('users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      roleStatus: 'rejected',
      approvedBy: req.user.userId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeJsonFile('users.json', users);
    
    const { password, ...safeUser } = users[userIndex];
    res.json({ message: 'User rejected successfully', user: safeUser });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Failed to reject user' });
  }
});

// Deactivate user
router.put('/users/:userId/deactivate', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await readJsonFile('users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (users[userIndex].role === 'admin') {
      return res.status(403).json({ message: 'Cannot deactivate admin users' });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      isActive: false,
      updatedAt: new Date().toISOString()
    };
    
    await writeJsonFile('users.json', users);
    
    const { password, ...safeUser } = users[userIndex];
    res.json({ message: 'User deactivated successfully', user: safeUser });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

module.exports = router;