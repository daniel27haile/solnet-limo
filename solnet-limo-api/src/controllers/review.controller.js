const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');

// POST /api/reviews — public
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, customerName, customerEmail, rating, comment, vehicleType } = req.body;

  if (!bookingId || !customerName || !customerEmail || !rating) {
    return error(res, 'bookingId, customerName, customerEmail and rating are required', 400);
  }

  const parsed = parseInt(rating, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 5) {
    return error(res, 'Rating must be a number between 1 and 5', 400);
  }

  const existing = await Review.findOne({ bookingId });
  if (existing) {
    return error(res, 'A review for this booking already exists', 409);
  }

  const review = await Review.create({
    bookingId,
    customerName,
    customerEmail,
    rating: parsed,
    comment: comment?.trim() || undefined,
    vehicleType: vehicleType?.trim() || undefined,
  });

  return created(res, review, 'Thank you for your review!');
});

// GET /api/reviews/public — public, approved only
const getPublicReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .select('customerName rating comment vehicleType createdAt');

  return success(res, reviews, 'Reviews fetched successfully');
});

// GET /api/reviews/admin — protected
const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  return success(res, reviews);
});

// PATCH /api/reviews/admin/:id/status — protected
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return error(res, 'Status must be pending, approved, or rejected', 400);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!review) {
    return error(res, 'Review not found', 404);
  }

  return success(res, review, `Review ${status}`);
});

module.exports = { createReview, getPublicReviews, getAllReviewsAdmin, updateReviewStatus };
