const mongoose = require('mongoose');

const pricingSettingSchema = new mongoose.Schema(
  {
    mileageThreshold: {
      type: Number,
      required: [true, 'Mileage threshold is required'],
      min: [1, 'Mileage threshold must be at least 1'],
      default: 30,
    },
    shortDistanceRate: {
      type: Number,
      required: [true, 'Short distance rate is required'],
      min: [0.01, 'Rate must be greater than 0'],
      default: 6,
    },
    longDistanceRate: {
      type: Number,
      required: [true, 'Long distance rate is required'],
      min: [0.01, 'Rate must be greater than 0'],
      default: 3,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingSetting', pricingSettingSchema);
