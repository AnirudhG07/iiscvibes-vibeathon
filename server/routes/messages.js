const express = require('express');
const { auth, requireAny, requireEventManager } = require('../middleware/auth');
const { readJsonFile, writeJsonFile, addToJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Submit contact message (any authenticated user)
router.post('/contact-admin', auth, requireAny, async (req, res) => {
  try {
    const {
      subject,
      message,
      priority,
      category,
      senderName,
      senderEmail,
      senderRole
    } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      subject,
      message,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'new',
      senderName,
      senderEmail,
      senderRole,
      senderId: req.user.id,
      createdAt: new Date().toISOString(),
      lastReply: null,
      replies: []
    };

    await addToJsonFile('messages.json', newMessage);

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: newMessage.id
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Get messages for admin (Event Manager only)
router.get('/admin', auth, requireEventManager, async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    
    let messages = [];
    try {
      messages = await readJsonFile('messages.json');
    } catch (error) {
      // File doesn't exist, return empty array
    }

    // Filter messages based on query
    let filteredMessages = messages;
    switch (filter) {
      case 'new':
        filteredMessages = messages.filter(m => m.status === 'new');
        break;
      case 'in_progress':
        filteredMessages = messages.filter(m => m.status === 'in_progress');
        break;
      case 'resolved':
        filteredMessages = messages.filter(m => m.status === 'resolved');
        break;
      case 'high_priority':
        filteredMessages = messages.filter(m => m.priority === 'high' || m.priority === 'urgent');
        break;
      default:
        filteredMessages = messages;
    }

    // Sort by creation date (newest first)
    filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      messages: filteredMessages,
      total: messages.length,
      filtered: filteredMessages.length
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

// Update message status (Event Manager only)
router.put('/:id/status', auth, requireEventManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'in_progress', 'resolved', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let messages = [];
    try {
      messages = await readJsonFile('messages.json');
    } catch (error) {
      return res.status(404).json({ message: 'Messages not found' });
    }

    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    messages[messageIndex].status = status;
    messages[messageIndex].updatedAt = new Date().toISOString();

    await writeJsonFile('messages.json', messages);

    res.json({
      success: true,
      message: 'Status updated successfully',
      updatedMessage: messages[messageIndex]
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

// Reply to message (Event Manager only)
router.post('/:id/reply', auth, requireEventManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    let messages = [];
    try {
      messages = await readJsonFile('messages.json');
    } catch (error) {
      return res.status(404).json({ message: 'Messages not found' });
    }

    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const reply = {
      id: `reply-${Date.now()}`,
      message,
      repliedBy: req.user.id,
      repliedByName: req.user.name,
      repliedAt: new Date().toISOString()
    };

    if (!messages[messageIndex].replies) {
      messages[messageIndex].replies = [];
    }

    messages[messageIndex].replies.push(reply);
    messages[messageIndex].lastReply = reply.repliedAt;
    messages[messageIndex].status = 'in_progress';

    await writeJsonFile('messages.json', messages);

    // Here you would typically send an email notification
    // For now, we'll just log it
    console.log(`Reply sent to ${messages[messageIndex].senderEmail}:`, message);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      reply
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ message: 'Failed to send reply', error: error.message });
  }
});

// Get message statistics (Event Manager only)
router.get('/stats', auth, requireEventManager, async (req, res) => {
  try {
    let messages = [];
    try {
      messages = await readJsonFile('messages.json');
    } catch (error) {
      // File doesn't exist, return empty stats
    }

    const stats = {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
      inProgress: messages.filter(m => m.status === 'in_progress').length,
      resolved: messages.filter(m => m.status === 'resolved').length,
      archived: messages.filter(m => m.status === 'archived').length,
      highPriority: messages.filter(m => m.priority === 'high' || m.priority === 'urgent').length,
      categories: messages.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
      }, {}),
      averageResponseTime: calculateAverageResponseTime(messages)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

function calculateAverageResponseTime(messages) {
  const respondedMessages = messages.filter(m => m.lastReply);
  if (respondedMessages.length === 0) return 0;

  const totalResponseTime = respondedMessages.reduce((acc, m) => {
    const createdAt = new Date(m.createdAt);
    const repliedAt = new Date(m.lastReply);
    return acc + (repliedAt - createdAt);
  }, 0);

  // Return average response time in hours
  return Math.round(totalResponseTime / respondedMessages.length / (1000 * 60 * 60));
}

module.exports = router;