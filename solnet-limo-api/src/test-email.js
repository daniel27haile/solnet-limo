/**
 * test-email.js — safe one-shot SMTP verification script
 *
 * Run from solnet-limo-api/:
 *   node src/test-email.js
 *
 * What it does:
 *   1. Loads .env via explicit __dirname path (same logic as env.js)
 *   2. Prints which SMTP host/user/port were loaded — never prints EMAIL_PASS
 *   3. Calls transporter.verify() to confirm the SMTP handshake succeeds
 *   4. Sends a test email to ADMIN_NOTIFICATION_EMAIL
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');

const host  = process.env.EMAIL_HOST;
const port  = Number(process.env.EMAIL_PORT) || 587;
const user  = process.env.EMAIL_USER;
const pass  = process.env.EMAIL_PASS;
const admin = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@solnetlimo.com';

console.log('--- SMTP Config Loaded ---');
console.log('EMAIL_HOST:               ', host  || '(not set)');
console.log('EMAIL_PORT:               ', port);
console.log('EMAIL_USER:               ', user  || '(not set)');
console.log('EMAIL_PASS loaded:        ', Boolean(pass));
console.log('ADMIN_NOTIFICATION_EMAIL: ', admin);
console.log('--------------------------');

if (!host || !user || !pass) {
  console.error('ERROR: EMAIL_HOST, EMAIL_USER, and EMAIL_PASS must all be set in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false, // STARTTLS on port 587
  auth: { user, pass },
});

(async () => {
  console.log('\nVerifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('SMTP connection OK — server is ready to send mail');
  } catch (err) {
    console.error('SMTP verify failed:', err.message);
    process.exit(1);
  }

  console.log(`\nSending test email to ${admin}...`);
  try {
    const info = await transporter.sendMail({
      from: `"Solnet Limo Test" <${user}>`,
      to: admin,
      subject: 'Solnet Limo — SMTP Test',
      text: `SMTP test successful.\n\nHost: ${host}\nPort: ${port}\nUser: ${user}`,
    });
    console.log('Test email sent. Message ID:', info.messageId);
  } catch (err) {
    console.error('Send failed:', err.message);
    process.exit(1);
  }
})();
