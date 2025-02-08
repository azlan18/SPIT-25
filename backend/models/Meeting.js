import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  sourceEmailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'
  },
  subject: String,
  dateTime: Date,
  calendarEventId: String,  // Google Calendar event ID
  meetLink: String,
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Meeting = mongoose.model('Meeting', MeetingSchema);