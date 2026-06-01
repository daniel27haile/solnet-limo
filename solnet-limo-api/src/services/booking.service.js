const Booking = require('../models/Booking');

const createBooking = async (data) => {
  return Booking.create(data);
};

const getAllBookings = async ({ status, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(filter),
  ]);

  return { bookings, total, page, pages: Math.ceil(total / limit) };
};

const getBookingById = async (id) => {
  return Booking.findById(id);
};

const updateBookingStatus = async (id, status) => {
  return Booking.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
};

const deleteBooking = async (id) => {
  return Booking.findByIdAndDelete(id);
};

const getBookingStats = async () => {
  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
  ]);
  return { total, pending, confirmed, completed, cancelled };
};

module.exports = { createBooking, getAllBookings, getBookingById, updateBookingStatus, deleteBooking, getBookingStats };
