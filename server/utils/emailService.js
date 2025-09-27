const nodemailer = require('nodemailer');

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
        from: `"${process.env.EVENT_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          to,
          subject,
          html: html.substring(0, 100) + '...'
        });
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
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