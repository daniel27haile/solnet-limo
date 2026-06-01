const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    pickupLatitude:  { type: Number },
    pickupLongitude: { type: Number },
    dropoffLocation: {
      type: String,
      required: [true, 'Drop-off location is required'],
      trim: true,
    },
    dropoffLatitude:  { type: Number },
    dropoffLongitude: { type: Number },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: [
        'Wedding',
        'Prom',
        'Homecoming',
        'Graduation',
        'Birthday',
        'Anniversary',
        'Conference',
        'Airport Transportation',
        'Hotel Transportation',
        'Restaurant Transportation',
        'Club Transportation',
        'Theater Transportation',
        'Cinema Transportation',
        'Cruise Transportation',
        'Downtown Transportation',
        'Medical Center Transportation',
        'Anywhere to Anywhere',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    passengers: {
      type: Number,
      required: [true, 'Number of passengers is required'],
      min: [1, 'At least 1 passenger is required'],
      max: [20, 'Cannot exceed 20 passengers'],
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    distanceMiles:  { type: Number },
    pricingRate:    { type: Number },
    pricingType: {
      type: String,
      enum: ['short-distance', 'long-distance'],
    },
    estimatedTotal: { type: Number },
    finalTotal:     { type: Number },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    squarePaymentId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
