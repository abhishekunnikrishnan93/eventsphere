const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Reserve seats temporarily
router.post('/reserve', protect, async (req, res) => {
  try {
    const { eventId, selectedSeats } = req.body;
    
    if (!selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({ message: 'No seats selected' });
    }

    // Atomic update: only updates if ALL selected seats are 'available'
    const updateResult = await Event.updateOne(
      {
        _id: eventId,
        // Ensure no selected seat is NOT 'available'
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: selectedSeats },
              status: { $ne: 'available' }
            }
          }
        }
      },
      {
        $set: { 'seats.$[elem].status': 'reserved' }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: selectedSeats } }]
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ message: 'One or more selected seats are no longer available. Please select different seats.' });
    }

    res.json({ message: 'Seats reserved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Release reserved seats
router.post('/release', protect, async (req, res) => {
  try {
    const { eventId, selectedSeats } = req.body;
    
    if (!selectedSeats || selectedSeats.length === 0) return res.json({ message: 'Nothing to release' });

    await Event.updateOne(
      { _id: eventId },
      { $set: { 'seats.$[elem].status': 'available' } },
      { arrayFilters: [{ 'elem.seatNumber': { $in: selectedSeats }, 'elem.status': 'reserved' }] }
    );

    res.json({ message: 'Seats released' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a booking (finalize)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, tickets, selectedSeats, paymentSimulationId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Atomically move seats from reserved to booked
    const updateResult = await Event.updateOne(
      {
        _id: eventId,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: selectedSeats },
              status: { $ne: 'reserved' }
            }
          }
        }
      },
      {
        $set: { 'seats.$[elem].status': 'booked' }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: selectedSeats } }]
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to confirm seats. They may have expired.' });
    }

    // Deduct available seats
    event.availableSeats -= tickets;
    await event.save();

    const totalPrice = event.price * tickets;

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      tickets,
      totalPrice,
      selectedSeats,
      paymentSimulationId
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings for current user
router.get('/mybookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('eventId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for an organizer's events
router.get('/organizer', protect, restrictTo('organizer', 'admin'), async (req, res) => {
  try {
    // Find all events created by the organizer
    const events = await Event.find({ organizerId: req.user.id });
    const eventIds = events.map(e => e._id);

    // Find all bookings for these events
    const bookings = await Booking.find({ eventId: { $in: eventIds } }).populate('eventId').populate('userId', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Restore seats in Event model
    const event = await Event.findById(booking.eventId);
    if (event) {
      // 1. Atomically update the seats array to make them available again
      await Event.updateOne(
        { _id: event._id },
        { 
          $set: { 'seats.$[elem].status': 'available' },
          $inc: { availableSeats: booking.tickets } 
        },
        { 
          arrayFilters: [{ 'elem.seatNumber': { $in: booking.selectedSeats } }] 
        }
      );
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
