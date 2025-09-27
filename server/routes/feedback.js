const express = require('express');
const { auth, requireAny, requireEventManager } = require('../middleware/auth');
const { addToJsonFile, readJsonFile, filterInJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Submit feedback
router.post('/submit', async (req, res) => {
  try {
    const {
      sessionId,
      sessionTitle,
      speakerName,
      track,
      timeSlot,
      rating,
      contentQuality,
      presentationSkills,
      relevance,
      comments,
      recommendToOthers,
      attendeeName,
      attendeeEmail
    } = req.body;
    
    // Validation
    if (!sessionId || !rating) {
      return res.status(400).json({ message: 'Session ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const feedbackData = {
      sessionId,
      sessionTitle,
      speakerName,
      track,
      timeSlot,
      rating,
      contentQuality: contentQuality || null,
      presentationSkills: presentationSkills || null,
      relevance: relevance || null,
      comments: comments || null,
      recommendToOthers: recommendToOthers || null,
      attendeeName: attendeeName || 'Anonymous',
      attendeeEmail: attendeeEmail || null,
      submissionDate: new Date().toISOString(),
      ipAddress: req.ip || null
    };
    
    const newFeedback = await addToJsonFile('feedback.json', feedbackData);
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: newFeedback.id
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Feedback submission failed', error: error.message });
  }
});

// Get feedback for a specific session (Event Manager only)
router.get('/session/:sessionId', auth, requireEventManager, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const feedback = await filterInJsonFile('feedback.json', f => f.sessionId === sessionId);
    
    if (feedback.length === 0) {
      return res.json({ feedback: [], stats: null });
    }
    
    // Calculate statistics
    const stats = {
      totalResponses: feedback.length,
      averageRating: (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2),
      ratingDistribution: {
        5: feedback.filter(f => f.rating === 5).length,
        4: feedback.filter(f => f.rating === 4).length,
        3: feedback.filter(f => f.rating === 3).length,
        2: feedback.filter(f => f.rating === 2).length,
        1: feedback.filter(f => f.rating === 1).length
      },
      averageContentQuality: feedback.filter(f => f.contentQuality).length > 0 
        ? (feedback.reduce((sum, f) => sum + (f.contentQuality || 0), 0) / feedback.filter(f => f.contentQuality).length).toFixed(2)
        : null,
      averagePresentationSkills: feedback.filter(f => f.presentationSkills).length > 0
        ? (feedback.reduce((sum, f) => sum + (f.presentationSkills || 0), 0) / feedback.filter(f => f.presentationSkills).length).toFixed(2)
        : null,
      averageRelevance: feedback.filter(f => f.relevance).length > 0
        ? (feedback.reduce((sum, f) => sum + (f.relevance || 0), 0) / feedback.filter(f => f.relevance).length).toFixed(2)
        : null,
      recommendationRate: feedback.filter(f => f.recommendToOthers === true).length / feedback.length * 100
    };
    
    res.json({ feedback, stats });
  } catch (error) {
    console.error('Get session feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch session feedback', error: error.message });
  }
});

// Get all feedback (Event Manager only)
router.get('/all', auth, requireEventManager, async (req, res) => {
  try {
    const { track, rating, dateFrom, dateTo } = req.query;
    
    let feedback = await readJsonFile('feedback.json');
    
    // Apply filters
    if (track) {
      feedback = feedback.filter(f => f.track === track);
    }
    
    if (rating) {
      feedback = feedback.filter(f => f.rating === parseInt(rating));
    }
    
    if (dateFrom) {
      feedback = feedback.filter(f => new Date(f.submissionDate) >= new Date(dateFrom));
    }
    
    if (dateTo) {
      feedback = feedback.filter(f => new Date(f.submissionDate) <= new Date(dateTo));
    }
    
    // Sort by submission date (newest first)
    feedback.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    res.json({ feedback });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
});

// Get feedback statistics (Event Manager only)
router.get('/stats', auth, requireEventManager, async (req, res) => {
  try {
    const feedback = await readJsonFile('feedback.json');
    const sessions = await readJsonFile('sessions.json');
    
    if (feedback.length === 0) {
      return res.json({ 
        stats: {
          totalFeedback: 0,
          averageRating: 0,
          responseRate: 0,
          topRatedSessions: [],
          feedbackByTrack: {}
        }
      });
    }
    
    // Group feedback by session
    const feedbackBySession = {};
    feedback.forEach(f => {
      if (!feedbackBySession[f.sessionId]) {
        feedbackBySession[f.sessionId] = [];
      }
      feedbackBySession[f.sessionId].push(f);
    });
    
    // Calculate session ratings
    const sessionRatings = Object.keys(feedbackBySession).map(sessionId => {
      const sessionFeedback = feedbackBySession[sessionId];
      const avgRating = sessionFeedback.reduce((sum, f) => sum + f.rating, 0) / sessionFeedback.length;
      const session = sessions.find(s => s.id === sessionId);
      
      return {
        sessionId,
        sessionTitle: session ? session.title : 'Unknown Session',
        speakerName: session ? session.speakerName : 'Unknown Speaker',
        averageRating: avgRating.toFixed(2),
        responseCount: sessionFeedback.length
      };
    });
    
    // Top rated sessions
    const topRatedSessions = sessionRatings
      .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
      .slice(0, 5);
    
    // Feedback by track
    const feedbackByTrack = {};
    feedback.forEach(f => {
      if (f.track) {
        if (!feedbackByTrack[f.track]) {
          feedbackByTrack[f.track] = {
            count: 0,
            totalRating: 0,
            averageRating: 0
          };
        }
        feedbackByTrack[f.track].count++;
        feedbackByTrack[f.track].totalRating += f.rating;
        feedbackByTrack[f.track].averageRating = (feedbackByTrack[f.track].totalRating / feedbackByTrack[f.track].count).toFixed(2);
      }
    });
    
    const stats = {
      totalFeedback: feedback.length,
      totalSessions: sessions.filter(s => s.status === 'approved').length,
      averageRating: (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2),
      responseRate: ((Object.keys(feedbackBySession).length / sessions.filter(s => s.status === 'approved').length) * 100).toFixed(1),
      topRatedSessions,
      feedbackByTrack,
      ratingDistribution: {
        5: feedback.filter(f => f.rating === 5).length,
        4: feedback.filter(f => f.rating === 4).length,
        3: feedback.filter(f => f.rating === 3).length,
        2: feedback.filter(f => f.rating === 2).length,
        1: feedback.filter(f => f.rating === 1).length
      },
      sessionsWithFeedback: Object.keys(feedbackBySession).length,
      averageResponsesPerSession: (feedback.length / Object.keys(feedbackBySession).length).toFixed(1)
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback statistics', error: error.message });
  }
});

// Export feedback data (Event Manager only)
router.get('/export', auth, requireEventManager, async (req, res) => {
  try {
    const feedback = await readJsonFile('feedback.json');
    
    const exportData = feedback.map(f => ({
      sessionId: f.sessionId,
      sessionTitle: f.sessionTitle,
      speakerName: f.speakerName,
      track: f.track,
      timeSlot: f.timeSlot,
      rating: f.rating,
      contentQuality: f.contentQuality,
      presentationSkills: f.presentationSkills,
      relevance: f.relevance,
      comments: f.comments,
      recommendToOthers: f.recommendToOthers,
      attendeeName: f.attendeeName,
      submissionDate: f.submissionDate
    }));
    
    res.json({ 
      feedback: exportData,
      exportDate: new Date().toISOString(),
      totalRecords: exportData.length
    });
  } catch (error) {
    console.error('Export feedback error:', error);
    res.status(500).json({ message: 'Feedback export failed', error: error.message });
  }
});

module.exports = router;