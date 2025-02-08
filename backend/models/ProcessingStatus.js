import mongoose from 'mongoose';

const ProcessingStatusSchema = new mongoose.Schema({
  lastProcessedAt: Date,
  lastMessageId: String
});

export const ProcessingStatus = mongoose.model('ProcessingStatus', ProcessingStatusSchema);