const mongoose = require('mongoose');

const fleetVehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: 'assets/images/fleet/default-fleet.jpg',
    },
    imageFit: {
      type: String,
      enum: ['cover', 'contain'],
      default: 'cover',
    },
    passengers: {
      type: Number,
      required: [true, 'Passenger capacity is required'],
      min: [1, 'At least 1 passenger'],
    },
    luggage: {
      type: Number,
      required: [true, 'Luggage capacity is required'],
      min: [0, 'Luggage cannot be negative'],
    },
    features: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FleetVehicle', fleetVehicleSchema);
