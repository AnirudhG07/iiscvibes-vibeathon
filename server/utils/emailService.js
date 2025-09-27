const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    // Initialize email logs path
    this.emailLogPath = path.join(__dirname, '../data/email-logs.json');
    
    // Only initialize transporter if email credentials are available
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.log('⚠️  Email credentials not configured. Running in demo mode - emails will be logged only.');
      this.transporter = null;
    }
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
        status: this.transporter ? 'sent' : 'logged_demo_mode'
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
  }er = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.EVENT_NAME || 'Vibeathon 2025'}" <${process.env.EMAIL_USER || 'noreply@vibeathon.com'}>`,
        to,
        subject,
        html,
        attachments
      };

      // Always log the email first
      const logEntry = await this.logEmail({
        to,
        subject,
        html: html.substring(0, 200) + (html.length > 200 ? '...' : ''),
        attachments: attachments.length > 0 ? `${attachments.length} attachments` : null
      });

      // If no transporter or in development mode, just return logged result
      if (!this.transporter || process.env.NODE_ENV === 'development') {
        console.log('📧 Email logged (demo mode):', {
          to,
          subject,
          preview: html.substring(0, 100) + '...'
        });
        return { success: true, messageId: logEntry.id };
      }

      // Try to send actual email if transporter is available
      try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully:', { to, subject, messageId: result.messageId });
        return { success: true, messageId: result.messageId };
      } catch (emailError) {
        console.error('Email sending failed, but logged:', emailError);
        return { success: true, messageId: logEntry.id, warning: 'Email logged but sending failed' };
      }
    } catch (error) {
      console.error('Email processing failed:', error);
      return { success: false, error: error.message };
    }
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

  // Alternative simple email without SMTP - creates mailto links
  generateMailtoLink(to, subject, body) {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body.replace(/<[^>]*>/g, '')); // Strip HTML tags
    return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  }

  // Email templates
  getRegistrationConfirmationTemplate(speakerName, eventName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to ${eventName}!</h2>
        <p>Dear ${speakerName},</p>
        <p>Thank you for registering as a speaker for ${eventName}. We're excited to have you join us!</p>
        <p>You can now:</p>
        <ul>
          <li>Submit session proposals</li>
          <li>Manage your speaker profile</li>
          <li>Access event resources</li>
        </ul>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>${eventName} Team</p>
      </div>
    `;
  }

  getSessionSubmissionTemplate(speakerName, sessionTitle) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Session Submission Received</h2>
        <p>Dear ${speakerName},</p>
        <p>We have received your session submission: <strong>"${sessionTitle}"</strong></p>
        <p>Our review committee will evaluate your submission and get back to you soon.</p>
        <p>You can track the status of your submission in your speaker dashboard.</p>
        <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
      </div>
    `;
  }

  getSessionApprovedTemplate(speakerName, sessionTitle, track, timeSlot) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🎉 Session Approved!</h2>
        <p>Dear ${speakerName},</p>
        <p>Congratulations! Your session <strong>"${sessionTitle}"</strong> has been approved.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Session Details:</h3>
          <p><strong>Track:</strong> ${track}</p>
          <p><strong>Time Slot:</strong> ${timeSlot}</p>
        </div>
        <p>Please confirm your participation and prepare for an amazing event!</p>
        <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
      </div>
    `;
  }

  getSessionRejectedTemplate(speakerName, sessionTitle, feedback) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Session Update</h2>
        <p>Dear ${speakerName},</p>
        <p>Thank you for your session submission: <strong>"${sessionTitle}"</strong></p>
        <p>Unfortunately, we cannot include this session in our current agenda due to space constraints and track focus.</p>
        ${feedback ? `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Feedback:</h3>
          <p>${feedback}</p>
        </div>` : ''}
        <p>We encourage you to submit for future events and thank you for your interest in ${process.env.EVENT_NAME}.</p>
        <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
      </div>
    `;
  }

  getDocumentUploadReminderTemplate(speakerName, deadline) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">📁 Document Upload Reminder</h2>
        <p>Dear ${speakerName},</p>
        <p>This is a friendly reminder to upload your presentation materials.</p>
        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
        <p>Please log in to your speaker dashboard to upload your documents.</p>
        <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
      </div>
    `;
  }

  getEventDayInstructionsTemplate(speakerName, checkInTime, venue) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">🎪 Event Day Instructions</h2>
        <p>Dear ${speakerName},</p>
        <p>We're excited to see you at ${process.env.EVENT_NAME}! Here are your event day details:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Important Information:</h3>
          <p><strong>Check-in Time:</strong> ${checkInTime}</p>
          <p><strong>Venue:</strong> ${venue}</p>
          <p><strong>Your QR Code:</strong> Available in your speaker dashboard</p>
        </div>
        <p>Please arrive early for check-in and t-shirt collection. Don't forget to bring your QR code!</p>
        <p>Best regards,<br>${process.env.EVENT_NAME} Team</p>
      </div>
    `;
  }
}

module.exports = new EmailService();