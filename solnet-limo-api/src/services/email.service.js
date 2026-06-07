const nodemailer = require('nodemailer');
const env = require('../config/env');
const { contactNotificationHtml, contactNotificationText, customerReplyHtml, customerReplyText } = require('../utils/emailTemplates');

const createTransporter = () => {
  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('Email configuration not set. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: false, // STARTTLS on port 587 — do not use SSL
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
    replyTo: env.EMAIL_USER,
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
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Vehicle</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.vehicleType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Date</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${new Date(booking.date).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Time</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.time}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Pickup</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.pickupLocation}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Drop-off</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.dropoffLocation}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Passengers</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.passengers}</td></tr>
          ${booking.distanceMiles ? `<tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Distance</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.distanceMiles} miles</td></tr>` : ''}
          ${booking.finalTotal ? `<tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Total Paid</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">$${booking.finalTotal.toFixed(2)} USD</td></tr>` : ''}
          ${booking.paymentStatus ? `<tr><td style="padding: 8px; border-bottom: 1px solid #333; color: #c9a84c;"><strong>Payment</strong></td><td style="padding: 8px; border-bottom: 1px solid #333;">${booking.paymentStatus}</td></tr>` : ''}
        </table>
        <p>For questions, call us at <strong>970-473-1479</strong> or email <strong>hello@solnetlimo.com</strong></p>
        <p style="color: #c9a84c; text-align: center; margin-top: 30px;"><em>Create an Elegant Impression & a Memory for the Lifetime!</em></p>
      </div>
    `,
  };

  const adminMail = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_USER}>`,
    replyTo: booking.email,
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
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Vehicle</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${booking.vehicleType}</td></tr>
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

  const name      = message.name  || 'Website Contact';
  const phone     = message.phone || 'Not provided';
  const submitted = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const templateData = {
    name,
    email:     message.email,
    phone,
    subject:   message.subject,
    message:   message.message,
    submitted,
  };

  const adminMail = {
    from:    `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_USER}>`,
    replyTo: `"${name}" <${message.email}>`,
    to:      env.ADMIN_NOTIFICATION_EMAIL,
    subject: 'Solnet Limo',
    html:    contactNotificationHtml(templateData),
    text:    contactNotificationText(templateData),
  };

  try {
    await transporter.sendMail(adminMail);
  } catch (err) {
    console.error('Email sending failed:', err.message);
  }
};

const sendCustomerReplyEmail = async ({ to, customerName, originalSubject, replyBody }) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const templateData = { customerName, replyBody, originalSubject };

  const mail = {
    from:    `"Solnet Limo" <${env.EMAIL_USER}>`,
    to,
    subject: `Re: ${originalSubject}`,
    html:    customerReplyHtml(templateData),
    text:    customerReplyText(templateData),
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    console.error('Customer reply email failed:', err.message);
    throw err; // re-throw so controller can return 502
  }
};

module.exports = { sendBookingConfirmation, sendContactNotification, sendCustomerReplyEmail };
