import express from 'express'
import { companyController } from '../controllers/companyController.js'
import { taskController } from '../controllers/taskController.js'
import { generateReport } from '../services/reportService.js'

const router = express.Router()

// Initialize mock data
companyController.initializeMockCompanies()
  .catch(err => console.error('Failed to initialize mock data:', err))

// Company routes
router.get('/companies', companyController.getAll)
router.post('/companies', companyController.create)

// Task routes
router.get('/tasks', taskController.getByCompany)
router.post('/tasks', taskController.create)
router.post('/tasks/:id/updates', taskController.addUpdate)

// Report generation route
router.post('/generate-report', async (req, res) => {
  try {
    // Validate input
    if (!req.body.prompt) {
      return res.status(400).json({
        error: 'Bad Request',
        details: 'Prompt is required'
      })
    }

    // Generate report with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Report generation timed out')), 30000)
    )

    const reportPromise = generateReport(req.body.prompt)
    const report = await Promise.race([reportPromise, timeoutPromise])

    if (!report) {
      return res.status(500).json({
        error: 'Generation Failed',
        details: 'No report was generated'
      })
    }

    // Return successful response
    res.json({ 
      success: true,
      report 
    })

  } catch (error) {
    console.error('Report generation error:', error)
    
    // Handle specific errors
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration Error',
        details: 'API key configuration issue'
      })
    }
    
    if (error.message.includes('timed out')) {
      return res.status(504).json({
        error: 'Timeout Error',
        details: 'Report generation took too long'
      })
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message || 'An unexpected error occurred'
    })
  }
})

export default router 