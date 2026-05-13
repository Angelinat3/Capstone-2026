require('dotenv').config()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// AI Provider Selection: 'gemini' | 'fastapi' | 'auto'
// - 'gemini': Always use Google Gemini API
// - 'fastapi': Always use external AI Service (FastAPI dari tim AI)
// - 'auto': Use Gemini if GEMINI_API_KEY exists, otherwise fallback to FastAPI
const AI_PROVIDER = process.env.AI_PROVIDER || 'auto'

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // AI Service (FastAPI dari tim AI) — dipakai jika AI_PROVIDER='fastapi' atau mode 'auto' tanpa Gemini key
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  AI_SERVICE_TIMEOUT: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
  // AI Provider Configuration
  AI_PROVIDER,
  // Google Gemini API — dipakai jika AI_PROVIDER='gemini' atau mode 'auto' dengan Gemini key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
}
