const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  durationDays: {
    type: Number,
    default: 1
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  },
  category: {
    type: String,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  seats: [{
    seatNumber: { type: String, required: true },
    status: { type: String, enum: ['available', 'reserved', 'booked'], default: 'available' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
