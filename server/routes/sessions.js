const express = require('express');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { auth, requireSpeaker, requireEventManager } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { addToJsonFile, updateInJsonFile, filterInJsonFile, findInJsonFile } = require('../utils/fileUtils');
const emailService = require('../utils/emailService');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Sessions API is working', timestamp: new Date().toISOString() });
});

// Submit new session (Speaker only)
router.post('/submit', auth, requireSpeaker, validateRequest(schemas.sessionSubmission), async (req, res) => {
  try {
    const {
      title,
      abstract,
      category,
      track,
      duration,
      coSpeaker,
      requirements,
      targetAudience
    } = req.body;

    // Check if change requests are still allowed (1 week before event)
    const eventDate = new Date(process.env.EVENT_DATE);
    const oneWeekBefore = new Date(eventDate);
    oneWeekBefore.setDate(eventDate.getDate() - parseInt(process.env.CHANGE_REQUEST_DEADLINE_DAYS));
    
    if (new Date() > oneWeekBefore) {
      return res.status(400).json({ 
        message: 'Session submissions are closed. Deadline has passed.' 
      });
    }

    const sessionData = {
      speakerId: req.user.id,
      speakerName: req.user.name,
      speakerEmail: req.user.email,
      title,
      abstract,
      category,
      track,
      duration,
      coSpeaker: coSpeaker || null,
      requirements: requirements || null,
      targetAudience: targetAudience || null,
      status: 'pending', // pending, approved, rejected, on_hold
      reviewFeedback: null,
      assignedTrack: null,
      timeSlot: null,
      room: null,
      submissionDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const newSession = await addToJsonFile('sessions.json', sessionData);

    // Send confirmation email
    await emailService.sendEmail(
      req.user.email,
      'Session Submission Received',
      emailService.getSessionSubmissionTemplate(req.user.name, title)
    );

    res.status(201).json({
      message: 'Session submitted successfully',
      session: newSession
    });
  } catch (error) {
    console.error('Session submission error:', error);
    res.status(500).json({ message: 'Session submission failed', error: error.message });
  }
});

// Get speaker's sessions
router.get('/my-sessions', auth, requireSpeaker, async (req, res) => {
  try {
    console.log('Fetching sessions for user:', req.user.id, req.user.name);
    const sessions = await filterInJsonFile('sessions.json', session => 
      session.speakerId === req.user.id
    );
    
    console.log('Found sessions:', sessions.length);
    sessions.forEach((session, index) => {
      console.log(`Session ${index + 1}:`, {
        id: session.id,
        title: session.title,
        status: session.status,
        hasQrCode: !!session.qrCode,
        qrCodeLength: session.qrCode ? session.qrCode.length : 0
      });
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
});

// Update session (Speaker only, before deadline)
router.put('/:sessionId', auth, requireSpeaker, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    // Check if the session belongs to the speaker
    const session = await findInJsonFile('sessions.json', s => 
      s.id === sessionId && s.speakerId === req.user.id
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if session is still editable
    if (session.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot edit session after review' 
      });
    }

    // Check deadline
    const eventDate = new Date(process.env.EVENT_DATE);
    const oneWeekBefore = new Date(eventDate);
    oneWeekBefore.setDate(eventDate.getDate() - parseInt(process.env.CHANGE_REQUEST_DEADLINE_DAYS));
    
    if (new Date() > oneWeekBefore) {
      return res.status(400).json({ 
        message: 'Session editing is closed. Deadline has passed.' 
      });
    }

    const updatedSession = await updateInJsonFile('sessions.json', sessionId, {
      ...updates,
      lastModified: new Date().toISOString()
    });

    res.json({
      message: 'Session updated successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({ message: 'Session update failed', error: error.message });
  }
});

// Get all sessions (Event Manager only)
router.get('/all', auth, requireEventManager, async (req, res) => {
  try {
    const { status, track, category } = req.query;
    
    let sessions = await filterInJsonFile('sessions.json', () => true);

    // Apply filters
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }
    if (track) {
      sessions = sessions.filter(s => s.track === track);
    }
    if (category) {
      sessions = sessions.filter(s => s.category === category);
    }

    res.json({ sessions });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
});

// Review session (Event Manager only)
router.put('/:sessionId/review', auth, requireEventManager, validateRequest(schemas.sessionReview), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, feedback, assignedTrack, timeSlot, room } = req.body;

    const session = await findInJsonFile('sessions.json', s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const updates = {
      status,
      reviewFeedback: feedback || null,
      reviewedBy: req.user.id,
      reviewedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    if (status === 'approved') {
      updates.assignedTrack = assignedTrack;
      updates.timeSlot = timeSlot;
      updates.room = room || null;
      
      // Generate QR code for approved session
      const qrData = {
        sessionId: sessionId,
        speakerId: session.speakerId,
        title: session.title,
        timeSlot: timeSlot,
        room: room,
        hash: crypto.createHash('sha256').update(`${sessionId}-${session.speakerId}-${process.env.JWT_SECRET}`).digest('hex')
      };
      
      const qrCodeData = JSON.stringify(qrData);
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);
      
      updates.qrCode = qrCodeImage;
      updates.qrData = qrData;
    }

    const updatedSession = await updateInJsonFile('sessions.json', sessionId, updates);

    // Send notification email
    let emailTemplate;
    let subject;

    switch (status) {
      case 'approved':
        subject = '🎉 Your Session has been Approved!';
        emailTemplate = emailService.getSessionApprovedTemplate(
          session.speakerName,
          session.title,
          assignedTrack,
          timeSlot
        );
        break;
      case 'rejected':
        subject = 'Session Review Update';
        emailTemplate = emailService.getSessionRejectedTemplate(
          session.speakerName,
          session.title,
          feedback
        );
        break;
      default:
        subject = 'Session Review Update';
        emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Session Review Update</h2>
            <p>Dear ${session.speakerName},</p>
            <p>Your session "${session.title}" is currently ${status.replace('_', ' ')}.</p>
            ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            <p>We'll keep you updated on any changes.</p>
            <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
          </div>
        `;
    }

    await emailService.sendEmail(session.speakerEmail, subject, emailTemplate);

    res.json({
      message: 'Session reviewed successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Session review error:', error);
    res.status(500).json({ message: 'Session review failed', error: error.message });
  }
});

// Submit change request (Speaker only)
router.post('/change-request', auth, requireSpeaker, validateRequest(schemas.changeRequest), async (req, res) => {
  try {
    const { sessionId, type, newValue, reason } = req.body;

    // Check if the session belongs to the speaker
    const session = await findInJsonFile('sessions.json', s => 
      s.id === sessionId && s.speakerId === req.user.id
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check deadline
    const eventDate = new Date(process.env.EVENT_DATE);
    const oneWeekBefore = new Date(eventDate);
    oneWeekBefore.setDate(eventDate.getDate() - parseInt(process.env.CHANGE_REQUEST_DEADLINE_DAYS));
    
    if (new Date() > oneWeekBefore) {
      return res.status(400).json({ 
        message: 'Change requests are closed. Deadline has passed.' 
      });
    }

    const changeRequestData = {
      sessionId,
      speakerId: req.user.id,
      speakerName: req.user.name,
      sessionTitle: session.title,
      type,
      currentValue: session[type] || 'N/A',
      newValue,
      reason,
      status: 'pending', // pending, approved, rejected
      requestDate: new Date().toISOString()
    };

    const newChangeRequest = await addToJsonFile('changeRequests.json', changeRequestData);

    res.status(201).json({
      message: 'Change request submitted successfully',
      changeRequest: newChangeRequest
    });
  } catch (error) {
    console.error('Change request error:', error);
    res.status(500).json({ message: 'Change request failed', error: error.message });
  }
});

// Get change requests (Event Manager only)
router.get('/change-requests', auth, requireEventManager, async (req, res) => {
  try {
    const { status } = req.query;
    
    let changeRequests = await filterInJsonFile('changeRequests.json', () => true);

    if (status) {
      changeRequests = changeRequests.filter(cr => cr.status === status);
    }

    res.json({ changeRequests });
  } catch (error) {
    console.error('Get change requests error:', error);
    res.status(500).json({ message: 'Failed to fetch change requests', error: error.message });
  }
});

// Scan session QR code (Event Manager only)
router.post('/scan-qr', auth, requireEventManager, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }

    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { sessionId, speakerId, hash } = parsedData;

    if (!sessionId || !speakerId || !hash) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    // Find the session
    const session = await findInJsonFile('sessions.json', s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify hash
    const expectedHash = crypto.createHash('sha256').update(`${sessionId}-${speakerId}-${process.env.JWT_SECRET}`).digest('hex');
    if (hash !== expectedHash) {
      return res.status(400).json({ message: 'Invalid QR code - security verification failed' });
    }

    // Check if session is approved
    if (session.status !== 'approved') {
      return res.status(400).json({ message: 'Session is not approved' });
    }

    // Update session to mark as checked in
    const updates = {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: req.user.id
    };

    const updatedSession = await updateInJsonFile('sessions.json', sessionId, updates);

    res.json({
      message: 'Session QR code verified successfully',
      session: {
        id: updatedSession.id,
        title: updatedSession.title,
        speakerName: updatedSession.speakerName,
        timeSlot: updatedSession.timeSlot,
        room: updatedSession.room,
        track: updatedSession.assignedTrack,
        checkedIn: updatedSession.checkedIn,
        checkedInAt: updatedSession.checkedInAt
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'QR scan failed', error: error.message });
  }
});

// Handle change request (Event Manager only)
router.put('/change-requests/:requestId', auth, requireEventManager, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, response } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const changeRequest = await findInJsonFile('changeRequests.json', cr => cr.id === requestId);
    if (!changeRequest) {
      return res.status(404).json({ message: 'Change request not found' });
    }

    // Update change request
    const updatedChangeRequest = await updateInJsonFile('changeRequests.json', requestId, {
      status,
      response: response || null,
      reviewedBy: req.user.id,
      reviewedAt: new Date().toISOString()
    });

    // If approved, update the session
    if (status === 'approved') {
      await updateInJsonFile('sessions.json', changeRequest.sessionId, {
        [changeRequest.type]: changeRequest.newValue,
        lastModified: new Date().toISOString()
      });
    }

    res.json({
      message: 'Change request processed successfully',
      changeRequest: updatedChangeRequest
    });
  } catch (error) {
    console.error('Change request processing error:', error);
    res.status(500).json({ message: 'Change request processing failed', error: error.message });
  }
});

module.exports = router;