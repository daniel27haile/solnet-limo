const nodemailer = require('nodemailer');
const env = require('../config/env');

const createTransporter = () => {
  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('Email configuration not set. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

const sendBookingConfirmation = async (booking) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const customerMail = {
    from: `"Solnet Limo" <${env.EMAIL_USER}>`,
    to: booking.email,
    subject: 'Booking Confirmation - Solnet Limo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px 20px;">
        <h1 style="color: #c9a84c; text-align: center;">Solnet Limo</h1>
        <h2 style="color: #fff; text-align: center;">Booking Received</h2>
        <p>Dear ${booking.fullName},</p>
        <p>Thank you for choosing <strong>Solnet Limo</strong>. We have received your booking request and will confirm it shortly.</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Service</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.serviceType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Date</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${new Date(booking.date).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Time</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.time}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Pickup</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.pickupLocation}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Drop-off</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.dropoffLocation}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Passengers</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.passengers}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Payment</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.paymentMethod}</td></tr>
        </table>
        <p>For questions, call us at <strong>970-473-1479</strong> or email <strong>Smoges16@yahoo.com</strong></p>
        <p style="color: #c9a84c; text-align: center; margin-top: 30px;"><em>Create an Elegant Impression & a Memory for the Lifetime!</em></p>
      </div>
    `,
  };

  const adminMail = {
    from: `"Solnet Limo System" <${env.EMAIL_USER}>`,
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New Booking Request - ${booking.fullName} (${booking.serviceType})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #c9a84c;">New Booking Request</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Name</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.fullName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Phone</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.phone}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Email</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.email}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Service</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.serviceType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Date</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${new Date(booking.date).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Time</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.time}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Pickup</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.pickupLocation}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Drop-off</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.dropoffLocation}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Passengers</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.passengers}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Payment</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.paymentMethod}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Notes</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.notes || 'None'}</td></tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMail);
    await transporter.sendMail(adminMail);
  } catch (err) {
    console.error('Email sending failed:', err.message);
  }
};

const sendContactNotification = async (message) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const adminMail = {
    from: `"Solnet Limo System" <${env.EMAIL_USER}>`,
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New Contact Message - ${message.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #c9a84c;">New Contact Message</h2>
        <p><strong>From:</strong> ${message.name} (${message.email})</p>
        <p><strong>Phone:</strong> ${message.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.message}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(adminMail);
  } catch (err) {
    console.error('Email sending failed:', err.message);
  }
};

module.exports = { sendBookingConfirmation, sendContactNotification };
