const asyncHandler = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const contactService = require('../services/contact.service');
const emailService = require('../services/email.service');

exports.createMessage = asyncHandler(async (req, res) => {
  const message = await contactService.createMessage(req.body);
  emailService.sendContactNotification(message).catch(() => {});
  created(res, message, 'Message sent successfully. We will respond shortly.');
});

exports.getAllMessages = asyncHandler(async (req, res) => {
  const { isRead, page, limit } = req.query;
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  const result = await contactService.getAllMessages({ ...filter, page: +page, limit: +limit });
  success(res, result);
});

exports.getMessageById = asyncHandler(async (req, res) => {
  const message = await contactService.getMessageById(req.params.id);
  if (!message) return error(res, 'Message not found', 404);
  success(res, message);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const message = await contactService.markAsRead(req.params.id);
  if (!message) return error(res, 'Message not found', 404);
  success(res, message, 'Message marked as read');
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await contactService.deleteMessage(req.params.id);
  if (!message) return error(res, 'Message not found', 404);
  success(res, null, 'Message deleted');
});

exports.getMessageStats = asyncHandler(async (req, res) => {
  const stats = await contactService.getMessageStats();
  success(res, stats);
});

exports.replyToMessage = asyncHandler(async (req, res) => {
  const { replyBody } = req.body;
  if (!replyBody || !replyBody.trim()) {
    return error(res, 'Reply message is required', 400);
  }

  const message = await contactService.getMessageById(req.params.id);
  if (!message) return error(res, 'Message not found', 404);

  try {
    await emailService.sendCustomerReplyEmail({
      to: message.email,
      customerName: message.name,
      originalSubject: message.subject,
      replyBody: replyBody.trim(),
    });
  } catch (err) {
    return error(res, 'Failed to send reply email. Please try again.', 502);
  }

  const updated = await contactService.markAsReplied(req.params.id);
  success(res, updated, 'Reply sent successfully');
});
