const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');

// Get email logs (admin only)
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await emailService.getEmailLogs(limit);

    res.json({ 
      success: true, 
      logs,
      total: logs.length,
      message: 'Email logs retrieved successfully'
    });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch email logs' 
    });
  }
});

// Test email endpoint (admin only)
router.post('/test', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Test Email</h2>
        <p>${message}</p>
        <p><small>This is a test email sent from Vibeathon 2025 system.</small></p>
      </div>
    `;

    const result = await emailService.sendEmail(to, subject, htmlMessage);

    res.json({
      success: true,
      message: 'Test email sent/logged successfully',
      result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email' 
    });
  }
});

// Generate mailto link for manual sending
router.post('/mailto', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    const mailtoLink = emailService.generateMailtoLink(to, subject, message);

    res.json({
      success: true,
      message: 'Mailto link generated successfully',
      mailtoLink,
      instructions: 'Click this link to open your default email client'
    });
  } catch (error) {
    console.error('Mailto generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate mailto link' 
    });
  }
});

module.exports = router;