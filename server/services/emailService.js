const fs = require('fs').promises;
const path = require('path');

// Simple email service that logs to console and file for demo purposes
// In production, you would integrate with services like:
// - NodeMailer with SMTP (Gmail, Outlook, etc.)
// - SendGrid, Mailgun, AWS SES
// - Resend, Postmark, etc.

class EmailService {
  constructor() {
    this.emailLogPath = path.join(__dirname, '../data/email-logs.json');
  }

  async logEmail(emailData) {
    try {
      let logs = [];
      try {
        const logContent = await fs.readFile(this.emailLogPath, 'utf8');
        logs = JSON.parse(logContent);
      } catch (error) {
        // File doesn't exist, start with empty array
      }

      const logEntry = {
        id: `email-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...emailData,
        status: 'logged' // In real implementation, this would be 'sent', 'failed', etc.
      };

      logs.unshift(logEntry);
      
      // Keep only last 100 emails
      if (logs.length > 100) {
        logs = logs.slice(0, 100);
      }

      await fs.writeFile(this.emailLogPath, JSON.stringify(logs, null, 2));
      return logEntry;
    } catch (error) {
      console.error('Error logging email:', error);
      throw error;
    }
  }

  async sendRegistrationConfirmation(userEmail, userName, userRole) {
    const emailData = {
      to: userEmail,
      from: 'noreply@vibeathon.com',
      subject: 'Welcome to Vibeathon 2025!',
      template: 'registration-confirmation',
      data: {
        userName,
        userRole,
        loginUrl: process.env.CLIENT_URL || 'http://localhost:3000/login',
        eventDate: 'March 15-16, 2025',
        venue: 'IISc Campus, Bangalore'
      }
    };

    // For demo: log to console and file
    console.log('📧 Email would be sent:', emailData);
    
    const logEntry = await this.logEmail(emailData);
    
    return {
      success: true,
      messageId: logEntry.id,
      message: 'Registration confirmation email logged (demo mode)'
    };
  }

  async sendSessionApprovedEmail(speakerEmail, speakerName, sessionTitle, track, timeSlot) {
    const emailData = {
      to: speakerEmail,
      from: 'noreply@vibeathon.com',
      subject: '🎉 Your Session has been Approved!',
      template: 'session-approved',
      data: {
        speakerName,
        sessionTitle,
        track,
        timeSlot,
        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/speaker/sessions`
      }
    };

    console.log('📧 Email would be sent:', emailData);
    
    const logEntry = await this.logEmail(emailData);
    
    return {
      success: true,
      messageId: logEntry.id,
      message: 'Session approval email logged (demo mode)'
    };
  }

  async sendSessionRejectedEmail(speakerEmail, speakerName, sessionTitle, feedback) {
    const emailData = {
      to: speakerEmail,
      from: 'noreply@vibeathon.com',
      subject: 'Session Review Update',
      template: 'session-rejected',
      data: {
        speakerName,
        sessionTitle,
        feedback,
        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/speaker/sessions`
      }
    };

    console.log('📧 Email would be sent:', emailData);
    
    const logEntry = await this.logEmail(emailData);
    
    return {
      success: true,
      messageId: logEntry.id,
      message: 'Session rejection email logged (demo mode)'
    };
  }

  async sendMessageReply(recipientEmail, recipientName, subject, replyMessage, originalMessage) {
    const emailData = {
      to: recipientEmail,
      from: 'admin@vibeathon.com',
      subject: `Re: ${subject}`,
      template: 'admin-reply',
      data: {
        recipientName,
        replyMessage,
        originalMessage,
        subject
      }
    };

    console.log('📧 Email would be sent:', emailData);
    
    const logEntry = await this.logEmail(emailData);
    
    return {
      success: true,
      messageId: logEntry.id,
      message: 'Admin reply email logged (demo mode)'
    };
  }

  async sendChangeRequestUpdate(speakerEmail, speakerName, sessionTitle, status, comments) {
    const emailData = {
      to: speakerEmail,
      from: 'noreply@vibeathon.com',
      subject: `Change Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      template: 'change-request-update',
      data: {
        speakerName,
        sessionTitle,
        status,
        comments,
        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/speaker/sessions`
      }
    };

    console.log('📧 Email would be sent:', emailData);
    
    const logEntry = await this.logEmail(emailData);
    
    return {
      success: true,
      messageId: logEntry.id,
      message: 'Change request update email logged (demo mode)'
    };
  }

  // Get email templates (HTML)
  getRegistrationTemplate(userName, userRole) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Welcome to Vibeathon 2025!</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for registering as a <strong>${userRole}</strong> for Vibeathon 2025!</p>
        <p>Your account has been created successfully. You can now log in to access your dashboard and manage your sessions.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Event Details:</h3>
          <ul>
            <li><strong>Date:</strong> March 15-16, 2025</li>
            <li><strong>Venue:</strong> IISc Campus, Bangalore</li>
            <li><strong>Website:</strong> <a href="http://localhost:3000">http://localhost:3000</a></li>
          </ul>
        </div>
        <p>We're excited to have you join us for this amazing event!</p>
        <p>Best regards,<br>The Vibeathon Team</p>
      </div>
    `;
  }

  getSessionApprovedTemplate(speakerName, sessionTitle, track, timeSlot) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">🎉 Your Session has been Approved!</h2>
        <p>Dear ${speakerName},</p>
        <p>Great news! Your session has been approved for Vibeathon 2025.</p>
        <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <h3>Session Details:</h3>
          <ul>
            <li><strong>Title:</strong> ${sessionTitle}</li>
            <li><strong>Track:</strong> ${track}</li>
            <li><strong>Time Slot:</strong> ${timeSlot}</li>
          </ul>
        </div>
        <p>Please log in to your dashboard to view your QR code and additional details.</p>
        <p>We look forward to your presentation!</p>
        <p>Best regards,<br>The Vibeathon Team</p>
      </div>
    `;
  }

  getSessionRejectedTemplate(speakerName, sessionTitle, feedback) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Session Review Update</h2>
        <p>Dear ${speakerName},</p>
        <p>Thank you for submitting your session proposal for Vibeathon 2025.</p>
        <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3>Session: ${sessionTitle}</h3>
          <p><strong>Feedback:</strong> ${feedback}</p>
        </div>
        <p>Please feel free to revise and resubmit your proposal, or contact us if you have any questions.</p>
        <p>Best regards,<br>The Vibeathon Team</p>
      </div>
    `;
  }

  // Get email logs for admin review
  async getEmailLogs(limit = 50) {
    try {
      const logContent = await fs.readFile(this.emailLogPath, 'utf8');
      const logs = JSON.parse(logContent);
      return logs.slice(0, limit);
    } catch (error) {
      return [];
    }
  }
}

module.exports = new EmailService();