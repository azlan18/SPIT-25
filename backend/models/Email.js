import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  messageId: { type: String, unique: true },  // Gmail message ID
  sender: String,
  subject: String,
  receivedAt: Date,
  analysis: {
    urgencyLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low']
    },
    meetingRequest: Boolean,
    requiredFollowUpActions: [String],
    analyzedAt: Date
  },
  processed: {
    type: Boolean,
    default: false
  }
});

export const Email = mongoose.model('Email', EmailSchema);