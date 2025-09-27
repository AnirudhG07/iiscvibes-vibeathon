const express = require('express');
const { auth, requireEventManager } = require('../middleware/auth');
const { readJsonFile, writeJsonFile, updateInJsonFile, addToJsonFile } = require('../utils/fileUtils');
const emailService = require('../utils/emailService');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', auth, requireEventManager, async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const sessions = await readJsonFile('sessions.json');
    const changeRequests = await readJsonFile('changeRequests.json');
    const agenda = await readJsonFile('agenda.json');
    
    const speakers = users.filter(u => u.role === 'speaker');
    
    const dashboardData = {
      totalSpeakers: speakers.length,
      totalSessions: sessions.length,
      approvedSessions: sessions.filter(s => s.status === 'approved').length,
      pendingSessions: sessions.filter(s => s.status === 'pending').length,
      rejectedSessions: sessions.filter(s => s.status === 'rejected').length,
      pendingChangeRequests: changeRequests.filter(cr => cr.status === 'pending').length,
      agendaPublished: agenda.length > 0 && agenda[0].published,
      speakersCheckedIn: speakers.filter(s => s.checkedIn).length,
      tshirtsCollected: speakers.filter(s => s.tshirtCollected).length,
      participationConfirmed: sessions.filter(s => s.participationConfirmed).length,
      documentsUploaded: sessions.filter(s => s.documentsUploaded).length
    };
    
    res.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Event manager dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

// Get all speakers with their details
router.get('/speakers', auth, requireEventManager, async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const sessions = await readJsonFile('sessions.json');
    
    const speakers = users.filter(u => u.role === 'speaker').map(speaker => {
      const speakerSessions = sessions.filter(s => s.speakerId === speaker.id);
      return {
        ...speaker,
        password: undefined, // Remove password from response
        sessionsCount: speakerSessions.length,
        approvedSessions: speakerSessions.filter(s => s.status === 'approved').length,
        sessions: speakerSessions
      };
    });
    
    res.json({ speakers });
  } catch (error) {
    console.error('Get speakers error:', error);
    res.status(500).json({ message: 'Failed to fetch speakers', error: error.message });
  }
});

// Enable/disable document upload
router.post('/enable-document-upload', auth, requireEventManager, async (req, res) => {
  try {
    const { enabled, deadline } = req.body;
    
    const settings = {
      documentUploadEnabled: enabled,
      documentUploadDeadline: deadline || null,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };
    
    await writeJsonFile('eventSettings.json', [settings]);
    
    res.json({ message: 'Document upload settings updated', settings });
  } catch (error) {
    console.error('Enable document upload error:', error);
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
});

// Send bulk emails
router.post('/send-bulk-email', auth, requireEventManager, async (req, res) => {
  try {
    const { recipients, subject, template, customMessage } = req.body;
    
    const users = await readJsonFile('users.json');
    let targetSpeakers = [];
    
    if (recipients === 'all') {
      targetSpeakers = users.filter(u => u.role === 'speaker');
    } else if (recipients === 'approved') {
      const sessions = await readJsonFile('sessions.json');
      const approvedSpeakerIds = sessions.filter(s => s.status === 'approved').map(s => s.speakerId);
      targetSpeakers = users.filter(u => approvedSpeakerIds.includes(u.id));
    }
    
    const emailPromises = targetSpeakers.map(speaker => {
      let emailContent;
      
      switch (template) {
        case 'document_reminder':
          emailContent = emailService.getDocumentUploadReminderTemplate(
            speaker.name,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          );
          break;
        case 'event_instructions':
          emailContent = emailService.getEventDayInstructionsTemplate(
            speaker.name,
            '8:00 AM',
            'Conference Hall'
          );
          break;
        default:
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">${subject}</h2>
              <p>Dear ${speaker.name},</p>
              <div>${customMessage}</div>
              <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
            </div>
          `;
      }
      
      return emailService.sendEmail(speaker.email, subject, emailContent);
    });
    
    await Promise.all(emailPromises);
    
    res.json({ 
      message: `Bulk email sent to ${targetSpeakers.length} speakers`,
      recipientCount: targetSpeakers.length
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Bulk email failed', error: error.message });
  }
});

// Export speaker data
router.get('/export-speakers', auth, requireEventManager, async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const sessions = await readJsonFile('sessions.json');
    
    const speakers = users.filter(u => u.role === 'speaker').map(speaker => {
      const speakerSessions = sessions.filter(s => s.speakerId === speaker.id);
      return {
        id: speaker.id,
        name: speaker.name,
        email: speaker.email,
        mobile: speaker.mobile,
        track: speaker.track,
        sessionCategory: speaker.sessionCategory,
        tshirtSize: speaker.tshirtSize,
        foodChoice: speaker.foodChoice,
        bloodGroup: speaker.bloodGroup,
        emergencyContact: speaker.emergencyContactName,
        emergencyPhone: speaker.emergencyContactNumber,
        linkedin: speaker.linkedinProfile,
        sapCommunity: speaker.sapCommunityUrl,
        sessionsSubmitted: speakerSessions.length,
        sessionsApproved: speakerSessions.filter(s => s.status === 'approved').length,
        checkedIn: speaker.checkedIn || false,
        tshirtCollected: speaker.tshirtCollected || false,
        registrationDate: speaker.createdAt
      };
    });
    
    res.json({ speakers, exportDate: new Date().toISOString() });
  } catch (error) {
    console.error('Export speakers error:', error);
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

module.exports = router;