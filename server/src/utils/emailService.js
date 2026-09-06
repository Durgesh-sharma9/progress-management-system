const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || 'ss6587493@gmail.com',
      pass: process.env.SMTP_PASS || 'gxxtesjbcrnevlqp',
    },
  });
};

/**
 * Send Developer Login Credentials Email
 * @param {Object} options
 * @param {string} options.name - Developer's full name
 * @param {string} options.email - Developer's email address
 * @param {string} options.password - Plain text password
 * @param {string} [options.loginUrl] - Custom portal login URL
 */
const sendDeveloperCredentialsEmail = async ({ name, email, password, loginUrl }) => {
  try {
    const portalUrl = loginUrl || 'https://codepilot.webncode.in/login';
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CodePilot</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
          margin: 0;
          padding: 24px;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 32px 24px;
          text-align: center;
          color: #ffffff;
        }
        .logo-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0 0 4px 0;
        }
        .subtitle {
          font-size: 13px;
          opacity: 0.9;
          margin: 0;
        }
        .content {
          padding: 32px 24px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #0f172a;
        }
        .text {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .credentials-card {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .cred-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #cbd5e1;
          font-size: 13px;
        }
        .cred-row:last-child {
          border-bottom: none;
        }
        .cred-label {
          font-weight: 600;
          color: #64748b;
        }
        .cred-value {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          font-weight: 700;
          color: #0f172a;
          word-break: break-all;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          padding: 12px 32px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 24px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">🚀 CodePilot</h1>
          <p class="subtitle">Engineering Progress & Attendance Portal</p>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name || 'Developer'}! 👋</div>
          <p class="text">
            Your developer portal account on <strong>CodePilot</strong> has been configured. You can now log in to track your assigned projects, deliverables, and mark your daily attendance.
          </p>

          <div class="credentials-card">
            <div class="cred-row">
              <span class="cred-label">Login Portal:</span>
              <span class="cred-value"><a href="${portalUrl}" style="color: #4f46e5; text-decoration: none;">${portalUrl}</a></span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Email ID:</span>
              <span class="cred-value">${email}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Password:</span>
              <span class="cred-value">${password}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Role:</span>
              <span class="cred-value">Developer</span>
            </div>
          </div>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Login to CodePilot Portal →</a>
          </div>

          <p class="text" style="font-size: 12px; color: #64748b; margin-top: 16px;">
            ⚠️ <em>Security Reminder: Please keep these credentials confidential. You may update your password anytime from your profile settings.</em>
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CodePilot. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM || `"CodePilot" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to CodePilot - Your Developer Login Credentials`,
      text: `Hello ${name},\n\nYour CodePilot account has been created.\n\nPortal URL: ${portalUrl}\nEmail: ${email}\nPassword: ${password}\n\nPlease login to start managing your projects and attendance.\n\nBest regards,\nCodePilot Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Credentials email sent to ${email} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send credentials email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendDeveloperCredentialsEmail,
};
