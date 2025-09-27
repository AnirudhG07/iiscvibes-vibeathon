const express = require('express');
const { auth, requireAny, requireEventManager } = require('../middleware/auth');
const { addToJsonFile, filterInJsonFile, updateInJsonFile } = require('../utils/fileUtils');
const emailService = require('../utils/emailService');

const router = express.Router();

// Get user notifications
router.get('/', auth, requireAny, async (req, res) => {
  try {
    const notifications = await filterInJsonFile('notifications.json', notification => 
      notification.userId === req.user.id || notification.userId === 'all'
    );
    
    // Sort by creation date (newest first)
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json({ notifications: sortedNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, requireAny, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await updateInJsonFile('notifications.json', notificationId, {
      read: true,
      readAt: new Date().toISOString()
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
});

// Create system notification (Event Manager only)
router.post('/system', auth, requireEventManager, async (req, res) => {
  try {
    const { title, message, type, targetUsers, priority } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    const notificationData = {
      title,
      message,
      type: type || 'info', // info, warning, success, error
      priority: priority || 'normal', // low, normal, high
      userId: targetUsers === 'all' ? 'all' : req.user.id,
      createdBy: req.user.id,
      read: false,
      system: true
    };
    
    const notification = await addToJsonFile('notifications.json', notificationData);
    
    res.status(201).json({ 
      message: 'System notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create system notification error:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
});

// Send reminder notifications
router.post('/send-reminders', auth, requireEventManager, async (req, res) => {
  try {
    const { type, customMessage } = req.body;
    
    const users = await filterInJsonFile('users.json', user => user.role === 'speaker');
    const sessions = await filterInJsonFile('sessions.json', session => session.status === 'approved');
    
    let targetSpeakers = [];
    let notificationTitle = '';
    let notificationMessage = '';
    
    switch (type) {
      case 'document_upload':
        // Find speakers with approved sessions who haven't uploaded documents
        const speakersWithApprovedSessions = sessions.map(s => s.speakerId);
        targetSpeakers = users.filter(u => 
          speakersWithApprovedSessions.includes(u.id) && !u.documentsUploaded
        );
        notificationTitle = '📁 Document Upload Reminder';
        notificationMessage = 'Please upload your presentation materials. Deadline approaching!';
        break;
        
      case 'participation_confirmation':
        // Find speakers who haven't confirmed participation
        const unconfirmedSessions = sessions.filter(s => !s.participationConfirmed);
        targetSpeakers = users.filter(u => 
          unconfirmedSessions.some(s => s.speakerId === u.id)
        );
        notificationTitle = '✅ Participation Confirmation Required';
        notificationMessage = 'Please confirm your participation for approved sessions.';
        break;
        
      case 'event_day':
        // All speakers with approved sessions
        const approvedSpeakerIds = sessions.map(s => s.speakerId);
        targetSpeakers = users.filter(u => approvedSpeakerIds.includes(u.id));
        notificationTitle = '🎪 Event Day Instructions';
        notificationMessage = customMessage || 'Important instructions for the event day. Check your email for details.';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid reminder type' });
    }
    
    // Create notifications for each target speaker
    const notificationPromises = targetSpeakers.map(speaker => 
      addToJsonFile('notifications.json', {
        title: notificationTitle,
        message: customMessage || notificationMessage,
        type: 'warning',
        priority: 'high',
        userId: speaker.id,
        createdBy: req.user.id,
        read: false,
        system: true,
        reminderType: type
      })
    );
    
    // Send emails for document upload reminders
    let emailPromises = [];
    if (type === 'document_upload') {
      emailPromises = targetSpeakers.map(speaker => 
        emailService.sendEmail(
          speaker.email,
          'Document Upload Reminder',
          emailService.getDocumentUploadReminderTemplate(
            speaker.name,
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
          )
        )
      );
    }
    
    await Promise.all([...notificationPromises, ...emailPromises]);
    
    res.json({ 
      message: `Reminders sent to ${targetSpeakers.length} speakers`,
      recipientCount: targetSpeakers.length,
      type
    });
  } catch (error) {
    console.error('Send reminders error:', error);
    res.status(500).json({ message: 'Failed to send reminders', error: error.message });
  }
});

// Get notification statistics (Event Manager only)
router.get('/stats', auth, requireEventManager, async (req, res) => {
  try {
    const notifications = await filterInJsonFile('notifications.json', () => true);
    
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {
        info: notifications.filter(n => n.type === 'info').length,
        warning: notifications.filter(n => n.type === 'warning').length,
        success: notifications.filter(n => n.type === 'success').length,
        error: notifications.filter(n => n.type === 'error').length
      },
      byPriority: {
        low: notifications.filter(n => n.priority === 'low').length,
        normal: notifications.filter(n => n.priority === 'normal').length,
        high: notifications.filter(n => n.priority === 'high').length
      },
      system: notifications.filter(n => n.system).length,
      recent: notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Failed to fetch notification stats', error: error.message });
  }
});

module.exports = router;