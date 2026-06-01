const asyncHandler = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const bookingService = require('../services/booking.service');
const emailService = require('../services/email.service');

exports.createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  emailService.sendBookingConfirmation(booking).catch(() => {});
  created(res, booking, 'Booking submitted successfully. We will confirm shortly.');
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await bookingService.getAllBookings({ status, page: +page, limit: +limit });
  success(res, result);
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);
  if (!booking) return error(res, 'Booking not found', 404);
  success(res, booking);
});

exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(req.params.id, status);
  if (!booking) return error(res, 'Booking not found', 404);
  success(res, booking, 'Booking status updated');
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.deleteBooking(req.params.id);
  if (!booking) return error(res, 'Booking not found', 404);
  success(res, null, 'Booking deleted');
});

exports.getBookingStats = asyncHandler(async (req, res) => {
  const stats = await bookingService.getBookingStats();
  success(res, stats);
});
