const ContactMessage = require('../models/ContactMessage');

const createMessage = async (data) => {
  return ContactMessage.create(data);
};

const getAllMessages = async ({ isRead, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead;

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(filter),
  ]);

  return { messages, total, page, pages: Math.ceil(total / limit) };
};

const getMessageById = async (id) => {
  return ContactMessage.findById(id);
};

const markAsRead = async (id) => {
  return ContactMessage.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

const deleteMessage = async (id) => {
  return ContactMessage.findByIdAndDelete(id);
};

const getMessageStats = async () => {
  const [total, unread] = await Promise.all([
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ isRead: false }),
  ]);
  return { total, unread };
};

module.exports = { createMessage, getAllMessages, getMessageById, markAsRead, deleteMessage, getMessageStats };
