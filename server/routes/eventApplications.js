const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { readJsonFile, addToJsonFile, updateInJsonFile, filterInJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Apply for speaker role in an event
router.post('/apply-speaker/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const applicationData = req.body;

    // Check if event exists and applications are open
    const events = await readJsonFile('events.json');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.speakerApplicationOpen) {
      return res.status(400).json({ message: 'Speaker applications are closed for this event' });
    }

    // Check if user already applied for this role in this event
    let applications = [];
    try {
      applications = await readJsonFile('eventApplications.json');
    } catch (error) {
      // File doesn't exist yet
    }

    const existingApplication = applications.find(app => 
      app.userId === userId && 
      app.eventId === eventId && 
      app.applicationType === 'speaker'
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied as a speaker for this event' });
    }

    // Create application
    const application = {
      userId,
      eventId,
      applicationType: 'speaker',
      status: 'pending',
      applicationData,
      appliedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      feedback: null
    };

    const newApplication = await addToJsonFile('eventApplications.json', application);

    res.status(201).json({
      message: 'Speaker application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Apply speaker error:', error);
    res.status(500).json({ message: 'Speaker application failed', error: error.message });
  }
});

// Apply for organizer role in an event
router.post('/apply-organizer/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const applicationData = req.body;

    // Check if event exists and applications are open
    const events = await readJsonFile('events.json');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.organizerApplicationOpen) {
      return res.status(400).json({ message: 'Organizer applications are closed for this event' });
    }

    // Check if user already applied for this role in this event
    let applications = [];
    try {
      applications = await readJsonFile('eventApplications.json');
    } catch (error) {
      // File doesn't exist yet
    }

    const existingApplication = applications.find(app => 
      app.userId === userId && 
      app.eventId === eventId && 
      app.applicationType === 'organizer'
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied as an organizer for this event' });
    }

    // Create application
    const application = {
      userId,
      eventId,
      applicationType: 'organizer',
      status: 'pending',
      applicationData,
      appliedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      feedback: null
    };

    const newApplication = await addToJsonFile('eventApplications.json', application);

    res.status(201).json({
      message: 'Organizer application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Apply organizer error:', error);
    res.status(500).json({ message: 'Organizer application failed', error: error.message });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    let applications = [];
    try {
      applications = await readJsonFile('eventApplications.json');
      applications = applications.filter(app => app.userId === userId);
    } catch (error) {
      // File doesn't exist yet
    }

    // Get event details for each application
    const events = await readJsonFile('events.json');
    const applicationsWithEvents = applications.map(app => {
      const event = events.find(e => e.id === app.eventId);
      return {
        ...app,
        event
      };
    });

    res.json({ applications: applicationsWithEvents });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// Get applications for an event (admin/organizers only)
router.get('/event/:eventId', auth, requireRole(['admin', 'organizer']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, applicationType } = req.query;

    // Check permissions
    if (req.user.role !== 'admin') {
      const events = await readJsonFile('events.json');
      const event = events.find(e => e.id === eventId);
      
      if (!event || !event.organizers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    let applications = [];
    try {
      applications = await readJsonFile('eventApplications.json');
      applications = applications.filter(app => app.eventId === eventId);
    } catch (error) {
      // File doesn't exist yet
    }

    // Apply filters
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    if (applicationType) {
      applications = applications.filter(app => app.applicationType === applicationType);
    }

    // Get user details for each application
    const users = await readJsonFile('users.json');
    const applicationsWithUsers = applications.map(app => {
      const user = users.find(u => u.id === app.userId);
      return {
        ...app,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          linkedinProfile: user.linkedinProfile
        } : null
      };
    });

    res.json({ applications: applicationsWithUsers });
  } catch (error) {
    console.error('Get event applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// Review application (admin/organizers only)
router.put('/review/:applicationId', auth, requireRole(['admin', 'organizer']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action, feedback } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
    }

    let applications = [];
    try {
      applications = await readJsonFile('eventApplications.json');
    } catch (error) {
      return res.status(404).json({ message: 'No applications found' });
    }

    const application = applications.find(app => app.id === applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      const events = await readJsonFile('events.json');
      const event = events.find(e => e.id === application.eventId);
      
      if (!event || !event.organizers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const updates = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: req.user.id,
      reviewedAt: new Date().toISOString(),
      feedback: feedback || null
    };

    const updatedApplication = await updateInJsonFile('eventApplications.json', applicationId, updates);

    res.json({
      message: `Application ${action}d successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ message: 'Application review failed', error: error.message });
  }
});

// Get pending applications count for admin dashboard
router.get('/pending-count', auth, requireRole(['admin']), async (req, res) => {
  try {
    let applications = [];
    try {
      applications = await readJsonFile('eventApplications.json');
    } catch (error) {
      // File doesn't exist yet
    }

    const pendingCount = applications.filter(app => app.status === 'pending').length;
    
    res.json({ pendingCount });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({ message: 'Failed to fetch pending count', error: error.message });
  }
});

module.exports = router;