const express = require('express');
const { auth, requireEventManager, requireAny } = require('../middleware/auth');
const { readJsonFile, writeJsonFile, addToJsonFile, updateInJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Get published agenda (accessible to all authenticated users)
router.get('/', auth, requireAny, async (req, res) => {
  try {
    const agenda = await readJsonFile('agenda.json');
    const sessions = await readJsonFile('sessions.json');
    
    if (agenda.length === 0 || !agenda[0].published) {
      return res.status(404).json({ message: 'Agenda not yet published' });
    }
    
    // Enrich agenda with session details
    const enrichedAgenda = agenda[0].schedule.map(item => {
      if (item.type === 'session' && item.sessionId) {
        const session = sessions.find(s => s.id === item.sessionId);
        return {
          ...item,
          sessionDetails: session
        };
      }
      return item;
    });
    
    res.json({ 
      agenda: {
        ...agenda[0],
        schedule: enrichedAgenda
      }
    });
  } catch (error) {
    console.error('Get agenda error:', error);
    res.status(500).json({ message: 'Failed to fetch agenda', error: error.message });
  }
});

// Get draft agenda (Event Manager only)
router.get('/draft', auth, requireEventManager, async (req, res) => {
  try {
    const agenda = await readJsonFile('agenda.json');
    const sessions = await readJsonFile('sessions.json');
    
    let currentAgenda;
    if (agenda.length === 0) {
      // Create default agenda structure
      currentAgenda = {
        eventName: process.env.EVENT_NAME,
        eventDate: process.env.EVENT_DATE,
        published: false,
        schedule: [],
        tracks: ['Track 1', 'Track 2', 'Track 3'],
        createdAt: new Date().toISOString()
      };
      await writeJsonFile('agenda.json', [currentAgenda]);
    } else {
      currentAgenda = agenda[0];
    }
    
    // Get approved sessions for agenda building
    const approvedSessions = sessions.filter(s => s.status === 'approved');
    
    res.json({ 
      agenda: currentAgenda,
      availableSessions: approvedSessions
    });
  } catch (error) {
    console.error('Get draft agenda error:', error);
    res.status(500).json({ message: 'Failed to fetch draft agenda', error: error.message });
  }
});

// Update agenda (Event Manager only)
router.put('/', auth, requireEventManager, async (req, res) => {
  try {
    const { schedule, tracks } = req.body;
    
    const agenda = await readJsonFile('agenda.json');
    
    const updatedAgenda = {
      ...agenda[0],
      schedule,
      tracks,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };
    
    await writeJsonFile('agenda.json', [updatedAgenda]);
    
    res.json({ 
      message: 'Agenda updated successfully',
      agenda: updatedAgenda
    });
  } catch (error) {
    console.error('Update agenda error:', error);
    res.status(500).json({ message: 'Agenda update failed', error: error.message });
  }
});

// Publish agenda (Event Manager only)
router.post('/publish', auth, requireEventManager, async (req, res) => {
  try {
    const agenda = await readJsonFile('agenda.json');
    
    if (agenda.length === 0) {
      return res.status(400).json({ message: 'No agenda to publish' });
    }
    
    const publishedAgenda = {
      ...agenda[0],
      published: true,
      publishedAt: new Date().toISOString(),
      publishedBy: req.user.id
    };
    
    await writeJsonFile('agenda.json', [publishedAgenda]);
    
    res.json({ 
      message: 'Agenda published successfully',
      agenda: publishedAgenda
    });
  } catch (error) {
    console.error('Publish agenda error:', error);
    res.status(500).json({ message: 'Agenda publishing failed', error: error.message });
  }
});

// Add agenda item (Event Manager only)
router.post('/item', auth, requireEventManager, async (req, res) => {
  try {
    const { type, title, startTime, endTime, track, room, sessionId, description } = req.body;
    
    const agenda = await readJsonFile('agenda.json');
    
    if (agenda.length === 0) {
      return res.status(400).json({ message: 'Agenda not initialized' });
    }
    
    const newItem = {
      id: require('uuid').v4(),
      type, // 'session', 'break', 'keynote', 'registration', 'networking'
      title,
      startTime,
      endTime,
      track: track || null,
      room: room || null,
      sessionId: sessionId || null,
      description: description || null,
      createdAt: new Date().toISOString()
    };
    
    const updatedAgenda = {
      ...agenda[0],
      schedule: [...agenda[0].schedule, newItem],
      updatedAt: new Date().toISOString()
    };
    
    await writeJsonFile('agenda.json', [updatedAgenda]);
    
    res.json({ 
      message: 'Agenda item added successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Add agenda item error:', error);
    res.status(500).json({ message: 'Failed to add agenda item', error: error.message });
  }
});

module.exports = router;