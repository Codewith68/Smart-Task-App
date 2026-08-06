const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Initialize the email transporter
   */
  init() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log('📧 Email service initialized');
    } else {
      console.log('📧 Email service not configured (missing EMAIL_USER/EMAIL_PASS)');
    }
  }

  /**
   * Send a task reminder email
   */
  async sendReminder(to, taskTitle, taskDescription, dueDate) {
    if (!this.transporter) {
      console.log(`📧 [MOCK] Reminder email to ${to}: "${taskTitle}"`);
      return;
    }

    const dueDateStr = dueDate ? new Date(dueDate).toLocaleString() : 'No due date';

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Smart Task App" <noreply@smarttask.app>',
      to,
      subject: `⏰ Reminder: ${taskTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Task Reminder</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #667eea; margin-top: 0;">${taskTitle}</h2>
            ${taskDescription ? `<p style="color: #b0b0b0; line-height: 1.6;">${taskDescription}</p>` : ''}
            <div style="background: #16213e; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #a0a0a0;">📅 Due: <strong style="color: #667eea;">${dueDateStr}</strong></p>
            </div>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; margin-top: 10px;">
              View Task →
            </a>
          </div>
          <div style="background: #0f0f23; padding: 15px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 12px;">Smart Task & Reminder App</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Reminder sent to ${to} for task: "${taskTitle}"`);
    } catch (error) {
      console.error(`📧 Failed to send email to ${to}:`, error.message);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    if (!this.transporter) {
      console.log(`📧 [MOCK] Password reset email to ${to}. Token: ${resetToken}`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Smart Task App" <noreply@smarttask.app>',
      to,
      subject: '🔐 Password Reset - Smart Task App',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
          </div>
          <div style="padding: 30px;">
            <p style="color: #b0b0b0; line-height: 1.6;">You requested a password reset. Click the button below to set a new password:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0;">
              Reset Password →
            </a>
            <p style="color: #666; font-size: 13px;">This link expires in 30 minutes. If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Password reset email sent to ${to}`);
    } catch (error) {
      console.error(`📧 Failed to send reset email:`, error.message);
    }
  }
}

module.exports = new EmailService();
