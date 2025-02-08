import mongoose from 'mongoose'

const updateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  }
})

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  date: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  notes: String,
  updates: [updateSchema]
}, {
  timestamps: true,
})

// Add a pre-save middleware to update the main task notes with the latest update
taskSchema.pre('save', function(next) {
  if (this.updates && this.updates.length > 0) {
    // Get the latest update
    const latestUpdate = this.updates[this.updates.length - 1]
    // Update the main task notes and status
    this.notes = latestUpdate.notes
    this.status = latestUpdate.status
  }
  next()
})

export const Task = mongoose.model('Task', taskSchema) 