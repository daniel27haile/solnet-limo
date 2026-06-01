const asyncHandler = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const pricingService = require('../services/pricing.service');
const paymentService = require('../services/payment.service');
const bookingService = require('../services/booking.service');
const emailService = require('../services/email.service');

exports.createPayment = asyncHandler(async (req, res) => {
  const { bookingDraft, sourceId } = req.body;

  if (!sourceId) {
    return error(res, 'Payment source ID is required', 400);
  }

  const required = ['fullName', 'phone', 'email', 'pickupLocation', 'dropoffLocation',
    'serviceType', 'vehicleType', 'date', 'time', 'passengers'];
  for (const field of required) {
    if (!bookingDraft?.[field]) {
      return error(res, `${field} is required`, 400);
    }
  }

  // Server-side pricing — never trust frontend amount
  let priceData;
  try {
    priceData = await pricingService.calculateForTrip(
      bookingDraft.pickupLocation,
      bookingDraft.dropoffLocation
    );
  } catch (mapErr) {
    return error(res, mapErr.message || 'Could not calculate trip distance', 422);
  }

  const finalTotal = priceData.estimatedTotal;
  const amountCents = Math.round(finalTotal * 100);

  // Create Square payment
  let paymentResult;
  let paymentStatus = 'failed';
  let squarePaymentId = null;

  try {
    paymentResult = await paymentService.createPayment({
      sourceId,
      amountCents,
      currency: priceData.currency,
      note: `Solnet Limo — ${bookingDraft.serviceType} — ${bookingDraft.vehicleType}`,
      customerEmail: bookingDraft.email,
    });
    paymentStatus = paymentResult.status === 'COMPLETED' ? 'paid' : 'failed';
    squarePaymentId = paymentResult.squarePaymentId;
  } catch (payErr) {
    // Save booking as payment failed so we have a record
    await bookingService.createBooking({
      ...bookingDraft,
      ...priceData,
      finalTotal,
      paymentStatus: 'failed',
    });
    return error(res, payErr?.response?.data?.errors?.[0]?.detail || payErr.message || 'Payment failed', 402);
  }

  // Save confirmed booking
  const booking = await bookingService.createBooking({
    ...bookingDraft,
    distanceMiles: priceData.distanceMiles,
    pricingRate: priceData.rateUsed,
    pricingType: priceData.pricingType,
    estimatedTotal: priceData.estimatedTotal,
    finalTotal,
    paymentStatus,
    squarePaymentId,
    paymentMethod: 'Square Card',
    status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
  });

  emailService.sendBookingConfirmation(booking).catch(() => {});

  created(res, {
    bookingId: booking._id,
    paymentStatus,
    finalTotal,
    currency: priceData.currency,
    distanceMiles: priceData.distanceMiles,
    pricingType: priceData.pricingType,
    rateUsed: priceData.rateUsed,
    squarePaymentId,
  }, 'Booking confirmed and payment processed.');
});
