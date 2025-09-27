const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { readJsonFile, addToJsonFile, updateInJsonFile, filterInJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const events = await readJsonFile('events.json');
    
    // Filter by status if provided
    const { status } = req.query;
    let filteredEvents = events;
    
    if (status) {
      filteredEvents = events.filter(event => event.status === status);
    }
    
    res.json({ events: filteredEvents });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// Get upcoming events (public)
router.get('/upcoming', async (req, res) => {
  try {
    const events = await readJsonFile('events.json');
    const now = new Date();
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate > now && event.status === 'upcoming';
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    res.json({ events: upcomingEvents });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events', error: error.message });
  }
});

// Get event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const events = await readJsonFile('events.json');
    const event = events.find(e => e.id === req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// Create new event (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizers: [req.user.id],
      currentAttendees: 0,
      currentSpeakers: 0,
      status: 'upcoming',
      registrationOpen: true
    };
    
    const newEvent = await addToJsonFile('events.json', eventData);
    
    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Event creation failed', error: error.message });
  }
});

// Update event (admin/organizer only)
router.put('/:id', auth, requireRole(['admin', 'organizer']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
    
    // Check if user has permission to update this event
    const events = await readJsonFile('events.json');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Admin can update any event, organizers can only update events they organize
    if (req.user.role !== 'admin' && !event.organizers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedEvent = await updateInJsonFile('events.json', eventId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Event update failed', error: error.message });
  }
});

// Register for event (authenticated users)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    // Get event details
    const events = await readJsonFile('events.json');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.registrationOpen) {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }
    
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    // Create or get registrations file
    let registrations = [];
    try {
      registrations = await readJsonFile('eventRegistrations.json');
    } catch (error) {
      // File doesn't exist, start with empty array
    }
    
    // Check if user is already registered
    const existingRegistration = registrations.find(r => r.eventId === eventId && r.userId === userId);
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Add registration
    const registration = {
      eventId,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      checkedIn: false
    };
    
    registrations.push(registration);
    
    // Save registrations
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.join(__dirname, '../data/eventRegistrations.json'),
      JSON.stringify(registrations, null, 2)
    );
    
    // Update event attendee count
    await updateInJsonFile('events.json', eventId, {
      currentAttendees: event.currentAttendees + 1
    });
    
    res.json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Event registration failed', error: error.message });
  }
});

// Get event registrations (admin/organizer only)
router.get('/:id/registrations', auth, requireRole(['admin', 'organizer']), async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check permissions
    if (req.user.role !== 'admin') {
      const events = await readJsonFile('events.json');
      const event = events.find(e => e.id === eventId);
      
      if (!event || !event.organizers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    let registrations = [];
    try {
      registrations = await readJsonFile('eventRegistrations.json');
      registrations = registrations.filter(r => r.eventId === eventId);
    } catch (error) {
      // File doesn't exist, return empty array
    }
    
    res.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
});

// Get user's event registrations
router.get('/my/registrations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let registrations = [];
    try {
      registrations = await readJsonFile('eventRegistrations.json');
      registrations = registrations.filter(r => r.userId === userId);
    } catch (error) {
      // File doesn't exist, return empty array
    }
    
    // Get event details for each registration
    const events = await readJsonFile('events.json');
    const userRegistrations = registrations.map(reg => {
      const event = events.find(e => e.id === reg.eventId);
      return {
        ...reg,
        event
      };
    });
    
    res.json({ registrations: userRegistrations });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const events = await readJsonFile('events.json');
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    events.splice(eventIndex, 1);
    await writeJsonFile('events.json', events);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;