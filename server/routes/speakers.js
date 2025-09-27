const express = require('express');
const { auth, requireSpeaker } = require('../middleware/auth');
const { updateInJsonFile, findInJsonFile, filterInJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Get speaker profile
router.get('/profile', auth, requireSpeaker, async (req, res) => {
  try {
    const speaker = await findInJsonFile('users.json', user => user.id === req.user.id);
    
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }

    // Remove sensitive information
    const { password, ...speakerProfile } = speaker;
    
    res.json({ speaker: speakerProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update speaker profile
router.put('/profile', auth, requireSpeaker, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.createdAt;
    
    const updatedSpeaker = await updateInJsonFile('users.json', req.user.id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Remove sensitive information
    const { password, ...speakerProfile } = updatedSpeaker;
    
    res.json({
      message: 'Profile updated successfully',
      speaker: speakerProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// Confirm participation
router.post('/confirm-participation', auth, requireSpeaker, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Verify session belongs to speaker
    const session = await findInJsonFile('sessions.json', s => 
      s.id === sessionId && s.speakerId === req.user.id && s.status === 'approved'
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Approved session not found' });
    }
    
    await updateInJsonFile('sessions.json', sessionId, {
      participationConfirmed: true,
      confirmationDate: new Date().toISOString()
    });
    
    res.json({ message: 'Participation confirmed successfully' });
  } catch (error) {
    console.error('Confirm participation error:', error);
    res.status(500).json({ message: 'Participation confirmation failed', error: error.message });
  }
});

// Get speaker dashboard data
router.get('/dashboard', auth, requireSpeaker, async (req, res) => {
  try {
    const sessions = await filterInJsonFile('sessions.json', session => 
      session.speakerId === req.user.id
    );
    
    const changeRequests = await filterInJsonFile('changeRequests.json', cr => 
      cr.speakerId === req.user.id
    );
    
    const speaker = await findInJsonFile('users.json', user => user.id === req.user.id);
    
    const dashboardData = {
      totalSessions: sessions.length,
      approvedSessions: sessions.filter(s => s.status === 'approved').length,
      pendingSessions: sessions.filter(s => s.status === 'pending').length,
      rejectedSessions: sessions.filter(s => s.status === 'rejected').length,
      pendingChangeRequests: changeRequests.filter(cr => cr.status === 'pending').length,
      qrCodeGenerated: speaker.qrCodeGenerated || false,
      checkedIn: speaker.checkedIn || false,
      tshirtCollected: speaker.tshirtCollected || false,
      recentSessions: sessions.slice(-3),
      recentChangeRequests: changeRequests.slice(-3)
    };
    
    res.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

module.exports = router;