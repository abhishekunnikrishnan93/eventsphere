require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventsphere');
    console.log('Connected to MongoDB');

    // Update all events that don't have a status or have status pending to approved
    const result = await Event.updateMany(
      { $or: [{ status: { $exists: false } }, { status: 'pending' }] },
      { $set: { status: 'approved' } }
    );
    
    console.log(`Updated ${result.modifiedCount} events to approved status.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
