import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

// Check for API key with better error message
const GEMINI_API_KEY = process.env.API_KEY
if (!GEMINI_API_KEY) {
  console.error('Environment Variables:', {
    keys: Object.keys(process.env),
    geminiKey: process.env.API_KEY,
  })
  throw new Error('GEMINI_API_KEY is not set in environment variables. Please check your .env file.')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function generateReport(prompt) {
  try {
    console.log('Initializing Gemini model...')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    console.log('Generating content with prompt:', prompt.substring(0, 100) + '...')
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    if (!result || !result.response) {
      console.error('No response received from Gemini')
      throw new Error('No response from AI model')
    }

    const response = await result.response
    const text = response.text()
    
    if (!text) {
      console.error('Empty text received from Gemini')
      throw new Error('Empty response from AI model')
    }

    console.log('Successfully generated report')
    return text
  } catch (error) {
    console.error('Detailed error in report generation:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    })
    
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key configuration. Please check your environment variables.')
    }
    throw new Error(`Failed to generate report: ${error.message}`)
  }
} 