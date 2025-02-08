import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'on-hold', 'completed'],
    default: 'active',
  },
  description: String,
}, { timestamps: true })

export const Company = mongoose.model('Company', companySchema) 