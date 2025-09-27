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
    
    // Generate QR ticket
    const QRCode = require('qrcode');
    const crypto = require('crypto');
    
    const ticketId = `ticket-${eventId}-${userId}-${Date.now()}`;
    const ticketData = {
      ticketId,
      eventId,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'event-ticket',
      generatedAt: new Date().toISOString(),
      securityHash: crypto.createHash('sha256').update(`${ticketId}-${userId}-${eventId}`).digest('hex')
    };
    
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(ticketData));
    
    // Create ticket record
    let tickets = [];
    try {
      tickets = await readJsonFile('eventTickets.json');
    } catch (error) {
      // File doesn't exist yet
    }
    
    const ticket = {
      id: ticketId,
      eventId,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      qrCode: qrCodeImage,
      ticketData: JSON.stringify(ticketData),
      status: 'active',
      isUsed: false,
      generatedAt: new Date().toISOString(),
      usedAt: null,
      scannedBy: null
    };
    
    tickets.push(ticket);
    
    // Save tickets
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.join(__dirname, '../data/eventTickets.json'),
      JSON.stringify(tickets, null, 2)
    );
    
    // Add registration
    const registration = {
      eventId,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      ticketId,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      checkedIn: false
    };
    
    registrations.push(registration);
    
    // Save registrations
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
      registration,
      ticket: {
        id: ticket.id,
        qrCode: ticket.qrCode,
        eventId: ticket.eventId,
        status: ticket.status
      }
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

// Get user's tickets
router.get('/my/tickets', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let tickets = [];
    try {
      tickets = await readJsonFile('eventTickets.json');
      tickets = tickets.filter(t => t.userId === userId);
    } catch (error) {
      // File doesn't exist, return empty array
    }
    
    // Get event details for each ticket
    const events = await readJsonFile('events.json');
    const userTickets = tickets.map(ticket => {
      const event = events.find(e => e.id === ticket.eventId);
      return {
        ...ticket,
        event
      };
    });
    
    res.json({ tickets: userTickets });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

// Get specific ticket by ID
router.get('/tickets/:ticketId', auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    
    let tickets = [];
    try {
      tickets = await readJsonFile('eventTickets.json');
    } catch (error) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Only allow user to view their own ticket or admin to view any ticket
    if (ticket.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get event details
    const events = await readJsonFile('events.json');
    const event = events.find(e => e.id === ticket.eventId);
    
    res.json({
      ticket: {
        ...ticket,
        event
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
});

// Validate and scan ticket (admin only)
router.post('/tickets/scan', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { ticketData, location } = req.body;
    
    let parsedTicketData;
    try {
      parsedTicketData = JSON.parse(ticketData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid ticket QR code format' });
    }
    
    const { ticketId, eventId, userId, securityHash, type } = parsedTicketData;
    
    if (type !== 'event-ticket') {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }
    
    // Verify security hash
    const crypto = require('crypto');
    const expectedHash = crypto.createHash('sha256').update(`${ticketId}-${userId}-${eventId}`).digest('hex');
    
    if (securityHash !== expectedHash) {
      return res.status(400).json({ message: 'Invalid ticket - security verification failed' });
    }
    
    // Find ticket in database
    let tickets = [];
    try {
      tickets = await readJsonFile('eventTickets.json');
    } catch (error) {
      return res.status(404).json({ message: 'Ticket database not found' });
    }
    
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ message: 'Ticket not found in database' });
    }
    
    const ticket = tickets[ticketIndex];
    
    if (ticket.isUsed) {
      return res.status(400).json({ 
        message: 'Ticket already used', 
        usedAt: ticket.usedAt,
        scannedBy: ticket.scannedBy
      });
    }
    
    if (ticket.status !== 'active') {
      return res.status(400).json({ message: 'Ticket is not active' });
    }
    
    // Mark ticket as used
    tickets[ticketIndex] = {
      ...ticket,
      isUsed: true,
      usedAt: new Date().toISOString(),
      scannedBy: req.user.id,
      scanLocation: location || 'event-entrance'
    };
    
    // Save updated tickets
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.join(__dirname, '../data/eventTickets.json'),
      JSON.stringify(tickets, null, 2)
    );
    
    // Record scan in scan history
    let qrScans = [];
    try {
      qrScans = await readJsonFile('qrScans.json');
    } catch (error) {
      // File doesn't exist yet
    }
    
    const scan = {
      ticketId,
      eventId,
      userId,
      scannedBy: req.user.id,
      scannedAt: new Date().toISOString(),
      type: 'ticket-scan',
      location: location || 'event-entrance',
      result: 'success'
    };
    
    qrScans.push(scan);
    
    fs.writeFileSync(
      path.join(__dirname, '../data/qrScans.json'),
      JSON.stringify(qrScans, null, 2)
    );
    
    // Update user check-in status
    await updateInJsonFile('users.json', userId, {
      checkedIn: true,
      lastCheckedIn: new Date().toISOString()
    });
    
    // Get user and event details for response
    const users = await readJsonFile('users.json');
    const events = await readJsonFile('events.json');
    
    const user = users.find(u => u.id === userId);
    const event = events.find(e => e.id === eventId);
    
    res.json({
      message: 'Ticket scanned successfully',
      ticket: tickets[ticketIndex],
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null,
      event: event ? {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        location: event.location
      } : null,
      scan
    });
  } catch (error) {
    console.error('Ticket scan error:', error);
    res.status(500).json({ message: 'Ticket scan failed', error: error.message });
  }
});

// Get all tickets for an event (admin only)
router.get('/:id/tickets', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    let tickets = [];
    try {
      tickets = await readJsonFile('eventTickets.json');
      tickets = tickets.filter(t => t.eventId === eventId);
    } catch (error) {
      // File doesn't exist, return empty array
    }
    
    res.json({ tickets });
  } catch (error) {
    console.error('Get event tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch event tickets', error: error.message });
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