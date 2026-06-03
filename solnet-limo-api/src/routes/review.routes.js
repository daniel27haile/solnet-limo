const express = require('express');
const router = express.Router();
const {
  createReview,
  getPublicReviews,
  getAllReviewsAdmin,
  updateReviewStatus,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.post('/', createReview);
router.get('/public', getPublicReviews);

// Admin — protected
router.get('/admin', protect, getAllReviewsAdmin);
router.patch('/admin/:id/status', protect, updateReviewStatus);

module.exports = router;
