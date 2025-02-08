import { Company } from '../models/Company.js'
import { mockCompanies } from '../data/mockCompanies.js'

export const companyController = {
  // Initialize mock companies if none exist
  async initializeMockCompanies() {
    try {
      const count = await Company.countDocuments()
      if (count === 0) {
        console.log('Seeding mock companies...')
        await Company.insertMany(mockCompanies)
        console.log('Mock companies seeded successfully')
      }
    } catch (error) {
      console.error('Failed to seed mock companies:', error)
    }
  },

  async getAll(req, res) {
    try {
      const companies = await Company.find().sort({ name: 1 })
      console.log('Found companies:', companies) // Debug log
      res.json(companies)
    } catch (error) {
      console.error('Error fetching companies:', error)
      res.status(500).json({ error: 'Failed to fetch companies' })
    }
  },

  async create(req, res) {
    try {
      const company = new Company(req.body)
      await company.save()
      res.status(201).json(company)
    } catch (error) {
      console.error('Error creating company:', error)
      res.status(400).json({ error: 'Failed to create company' })
    }
  },

  async update(req, res) {
    try {
      const company = await Company.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      )
      if (!company) {
        return res.status(404).json({ error: 'Company not found' })
      }
      res.json(company)
    } catch (error) {
      res.status(400).json({ error: 'Failed to update company' })
    }
  },
} 