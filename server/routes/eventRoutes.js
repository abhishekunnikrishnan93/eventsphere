const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get all approved events (Public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' }).populate('organizerId', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events for admin dashboard
router.get('/admin/all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const events = await Event.find().populate('organizerId', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event status (Admin only)
router.put('/:id/status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event (Organizer/Admin only)
router.post('/', protect, restrictTo('organizer', 'admin'), async (req, res) => {
  try {
    const { title, description, date, endDate, durationDays, location, price, totalSeats, imageUrl, category } = req.body;
    
    // Generate seat layout dynamically
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const colsPerRow = 25;
    const generatedSeats = [];
    
    for (let i = 0; i < totalSeats; i++) {
      const rowIndex = Math.floor(i / colsPerRow);
      const colIndex = (i % colsPerRow) + 1;
      const rowLetter = rowIndex < rows.length ? rows[rowIndex] : `R${rowIndex}`;
      generatedSeats.push({
        seatNumber: `${rowLetter}${colIndex}`,
        status: 'available'
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      endDate: durationDays > 1 ? endDate : undefined,
      durationDays: durationDays || 1,
      location,
      price,
      totalSeats,
      availableSeats: totalSeats,
      organizerId: req.user.id,
      imageUrl,
      category,
      seats: generatedSeats
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (Organizer of the event or Admin)
router.put('/:id', protect, restrictTo('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Ensure only the organizer who created the event or admin can edit it
    if (event.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    // if totalSeats changes, adjust availableSeats
    let newAvailableSeats = event.availableSeats;
    if (req.body.totalSeats && req.body.totalSeats !== event.totalSeats) {
      const diff = req.body.totalSeats - event.totalSeats;
      newAvailableSeats += diff;
      if (newAvailableSeats < 0) return res.status(400).json({ message: 'Cannot reduce seats below booked amount' });
    }

    // Reset status to pending if organizer edits it
    let statusUpdate = {};
    if (req.user.role === 'organizer') {
      statusUpdate.status = 'pending';
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, availableSeats: newAvailableSeats, ...statusUpdate },
      { new: true, runValidators: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', protect, restrictTo('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events by organizer
router.get('/organizer/:id', protect, restrictTo('organizer', 'admin'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const events = await Event.find({ organizerId: req.params.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
