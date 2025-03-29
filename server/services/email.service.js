
const nodemailer = require('nodemailer');

// Create a transporter object
let transporter;

// Initialize the transporter based on environment
if (process.env.NODE_ENV === 'production') {
  // Production email configuration
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  // Development email configuration using Ethereal (fake SMTP service)
  // This will log email contents to console and provide a URL to preview
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email', // This is a placeholder
      pass: 'ethereal.pass', // This is a placeholder
    },
  });
}

// Create Ethereal account for development if needed
const initializeTransporter = async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Generate a test account on ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      
      // Update the transporter with the test credentials
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('Ethereal email account created for testing:', testAccount.user);
    } catch (error) {
      console.error('Failed to create Ethereal test account:', error);
    }
  }
};

// Initialize on startup
initializeTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"IAM System" <no-reply@example.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // For development: log the Ethereal URL to view the email
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send an OTP verification email
 * @param {string} email - Recipient's email
 * @param {string} otp - One-time password
 * @returns {Promise<Object>} - Nodemailer info object 
 */
const sendOtpEmail = async (email, otp) => {
  const subject = 'Your Password Reset Code';
  const text = `Your verification code is: ${otp}. It will expire in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Verification</h2>
      <p>We received a request to reset your password. Please use the following code to verify your identity:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email or contact support.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  initializeTransporter,
};
