/**
 * emailTemplates.js
 *
 * Centralised email HTML/text templates for Solnet Limo.
 * All user-supplied values are passed through escapeHtml() before
 * being embedded in HTML to prevent injection attacks.
 */

// ─── HTML escape helper ──────────────────────────────────────────────────────
const escapeHtml = (value) => {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ─── Contact notification — HTML ─────────────────────────────────────────────
/**
 * @param {{ name, email, phone, subject, message, submitted }} data
 * @returns {string} Full HTML email string
 */
const contactNotificationHtml = ({ name, email, phone, subject, message, submitted }) => {
  const n  = escapeHtml(name);
  const e  = escapeHtml(email);
  const ph = escapeHtml(phone);
  const s  = escapeHtml(subject);
  // Escape message content, then convert newlines to <br> for display
  const msg = escapeHtml(message).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Contact Message - Solnet Limo</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <!--[if mso]><table role="presentation" width="100%" align="center"><tr><td><![endif]-->

  <!-- Outer wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
    style="background-color:#f4f4f4;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Email container — 640px wide -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640"
          style="max-width:640px;width:100%;border-collapse:collapse;background:#ffffff;">

          <!-- ── INTERNAL NOTICE ───────────────────────────────────── -->
          <tr>
            <td style="background-color:#fff3cd;border-bottom:1px solid #ffc107;padding:10px 32px;">
              <p style="margin:0;font-size:12px;font-weight:bold;color:#856404;letter-spacing:0.04em;">
                &#9888; INTERNAL NOTIFICATION &mdash; Do not forward this email to the customer.
                Reply directly from the admin panel or use the link below.
              </p>
            </td>
          </tr>

          <!-- ── HEADER ─────────────────────────────────────────────── -->
          <tr>
            <td bgcolor="#111111" style="background-color:#111111;padding:0;">

              <!-- Gold top accent bar -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;">
                <tr>
                  <td height="4" bgcolor="#c8a94d"
                    style="background-color:#c8a94d;font-size:1px;line-height:1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Brand name + subtitle -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;">
                <tr>
                  <td style="padding:28px 32px 24px;background-color:#111111;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#c8a94d;
                               letter-spacing:0.04em;line-height:1.2;">
                      Solnet Limo
                    </p>
                    <p style="margin:6px 0 0;font-size:11px;color:#888888;
                               letter-spacing:0.1em;text-transform:uppercase;line-height:1.4;">
                      New Website Contact Message
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── CONTACT DETAILS CARD ───────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px 0;background-color:#ffffff;">

              <!-- Card label -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:bold;color:#888888;
                         letter-spacing:0.1em;text-transform:uppercase;">
                Contact Details
              </p>

              <!-- Details table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;border:1px solid #e5e5e5;border-radius:4px;">

                <!-- Name -->
                <tr>
                  <td width="110" valign="top"
                    style="padding:11px 14px;border-bottom:1px solid #f0f0f0;
                           font-size:12px;font-weight:bold;color:#666666;
                           background-color:#fafafa;">
                    Name
                  </td>
                  <td valign="top"
                    style="padding:11px 16px;border-bottom:1px solid #f0f0f0;
                           font-size:14px;color:#222222;">
                    ${n}
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td width="110" valign="top"
                    style="padding:11px 14px;border-bottom:1px solid #f0f0f0;
                           font-size:12px;font-weight:bold;color:#666666;
                           background-color:#fafafa;">
                    Email
                  </td>
                  <td valign="top"
                    style="padding:11px 16px;border-bottom:1px solid #f0f0f0;
                           font-size:14px;color:#222222;">
                    <a href="mailto:${e}"
                      style="color:#c8a94d;text-decoration:none;font-weight:bold;">
                      ${e}
                    </a>
                  </td>
                </tr>

                <!-- Phone -->
                <tr>
                  <td width="110" valign="top"
                    style="padding:11px 14px;border-bottom:1px solid #f0f0f0;
                           font-size:12px;font-weight:bold;color:#666666;
                           background-color:#fafafa;">
                    Phone
                  </td>
                  <td valign="top"
                    style="padding:11px 16px;border-bottom:1px solid #f0f0f0;
                           font-size:14px;color:#222222;">
                    ${ph}
                  </td>
                </tr>

                <!-- Subject -->
                <tr>
                  <td width="110" valign="top"
                    style="padding:11px 14px;border-bottom:1px solid #f0f0f0;
                           font-size:12px;font-weight:bold;color:#666666;
                           background-color:#fafafa;">
                    Subject
                  </td>
                  <td valign="top"
                    style="padding:11px 16px;border-bottom:1px solid #f0f0f0;
                           font-size:14px;color:#222222;">
                    ${s}
                  </td>
                </tr>

                <!-- Submitted -->
                <tr>
                  <td width="110" valign="top"
                    style="padding:11px 14px;font-size:12px;font-weight:bold;
                           color:#666666;background-color:#fafafa;">
                    Submitted
                  </td>
                  <td valign="top"
                    style="padding:11px 16px;font-size:13px;color:#888888;">
                    ${escapeHtml(submitted)}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ── MESSAGE ────────────────────────────────────────────── -->
          <tr>
            <td style="padding:24px 32px 0;background-color:#ffffff;">

              <p style="margin:0 0 10px;font-size:11px;font-weight:bold;color:#888888;
                         letter-spacing:0.1em;text-transform:uppercase;">
                Message
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;border:1px solid #e5e5e5;border-left:3px solid #c8a94d;">
                <tr>
                  <td style="padding:16px 20px;font-size:14px;line-height:1.75;
                             color:#333333;background-color:#fafafa;">
                    ${msg}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── REPLY INSTRUCTION ──────────────────────────────────── -->
          <tr>
            <td style="padding:20px 32px 28px;background-color:#ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;background-color:#fffcf0;
                       border:1px solid #f0e5b8;border-radius:4px;">
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#555555;line-height:1.5;">
                    <strong style="color:#c8a94d;">&#8594; Click Reply</strong>
                    to respond directly to <strong>${n}</strong>
                    at <a href="mailto:${e}"
                          style="color:#c8a94d;text-decoration:none;">${e}</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────────── -->
          <tr>
            <td bgcolor="#111111"
              style="padding:20px 32px;background-color:#111111;border-top:3px solid #c8a94d;">
              <p style="margin:0;font-size:13px;font-weight:bold;color:#c8a94d;">
                Solnet Limo
              </p>
              <p style="margin:5px 0 0;font-size:11px;color:#666666;line-height:1.5;">
                This is an automated notification from the Solnet Limo website contact form.<br>
                To reply to this customer, use the <strong style="color:#888888;">Reply</strong>
                button in your email client.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email container -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

  <!--[if mso]></td></tr></table><![endif]-->

</body>
</html>`;
};

// ─── Contact notification — plain text fallback ───────────────────────────────
/**
 * @param {{ name, email, phone, subject, message, submitted }} data
 * @returns {string} Plain text email string
 */
const contactNotificationText = ({ name, email, phone, subject, message, submitted }) => `
SOLNET LIMO — New Website Contact Message
==========================================

Name:      ${name || 'Not provided'}
Email:     ${email || 'Not provided'}
Phone:     ${phone || 'Not provided'}
Subject:   ${subject || 'No subject'}
Submitted: ${submitted}

Message:
----------
${message}

--
Reply to this email to respond directly to ${name} at ${email}.
This is an automated notification from the Solnet Limo website contact form.
`.trim();

// ─── Customer reply email — HTML ─────────────────────────────────────────────
/**
 * @param {{ customerName, replyBody, originalSubject }} data
 * @returns {string} Full HTML email string
 */
const customerReplyHtml = ({ customerName, replyBody, originalSubject }) => {
  const n    = escapeHtml(customerName);
  const subj = escapeHtml(originalSubject);
  const body = escapeHtml(replyBody).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reply from Solnet Limo</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
    style="background-color:#f4f4f4;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640"
          style="max-width:640px;width:100%;border-collapse:collapse;background:#ffffff;">

          <!-- ── HEADER ──────────────────────────────────────────────── -->
          <tr>
            <td bgcolor="#111111" style="background-color:#111111;padding:0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;">
                <tr>
                  <td height="4" bgcolor="#c8a94d"
                    style="background-color:#c8a94d;font-size:1px;line-height:1px;">&nbsp;</td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;">
                <tr>
                  <td style="padding:28px 32px 24px;background-color:#111111;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#c8a94d;
                               letter-spacing:0.04em;line-height:1.2;">
                      Solnet Limo
                    </p>
                    <p style="margin:6px 0 0;font-size:11px;color:#888888;
                               letter-spacing:0.1em;text-transform:uppercase;line-height:1.4;">
                      Message from our team
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING ────────────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px 0;background-color:#ffffff;">
              <p style="margin:0 0 8px;font-size:15px;color:#222222;">
                Dear <strong>${n}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:13px;color:#888888;">
                In reply to your message: <em>${subj}</em>
              </p>
            </td>
          </tr>

          <!-- ── REPLY BODY ──────────────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px 24px;background-color:#ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="border-collapse:collapse;border:1px solid #e5e5e5;border-left:3px solid #c8a94d;">
                <tr>
                  <td style="padding:20px 24px;font-size:15px;line-height:1.75;
                             color:#333333;background-color:#fafafa;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SIGN-OFF ────────────────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px 28px;background-color:#ffffff;">
              <p style="margin:0;font-size:14px;color:#444444;line-height:1.6;">
                Warm regards,<br>
                <strong style="color:#222222;">Solnet Limo Team</strong>
              </p>
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────────── -->
          <tr>
            <td bgcolor="#111111"
              style="padding:20px 32px;background-color:#111111;border-top:3px solid #c8a94d;">
              <p style="margin:0;font-size:13px;font-weight:bold;color:#c8a94d;">
                Solnet Limo
              </p>
              <p style="margin:5px 0 0;font-size:11px;color:#666666;line-height:1.5;">
                Phone: 970-473-1479 &nbsp;|&nbsp;
                <a href="mailto:hello@solnetlimo.com"
                   style="color:#888888;text-decoration:none;">hello@solnetlimo.com</a>
              </p>
              <p style="margin:6px 0 0;font-size:10px;color:#555555;font-style:italic;">
                Create an Elegant Impression &amp; a Memory for the Lifetime!
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};

// ─── Customer reply email — plain text ───────────────────────────────────────
/**
 * @param {{ customerName, replyBody, originalSubject }} data
 * @returns {string} Plain text email string
 */
const customerReplyText = ({ customerName, replyBody, originalSubject }) => `
Dear ${customerName},

In reply to your message: ${originalSubject}

${replyBody}

--
Warm regards,
Solnet Limo Team
Phone: 970-473-1479 | hello@solnetlimo.com
Create an Elegant Impression & a Memory for the Lifetime!
`.trim();

module.exports = { contactNotificationHtml, contactNotificationText, customerReplyHtml, customerReplyText, escapeHtml };
