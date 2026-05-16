import dotenv from 'dotenv'
dotenv.config()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// AI Provider Selection: 'gemini' | 'fastapi' | 'auto'
export const AI_PROVIDER = process.env.AI_PROVIDER || 'auto'

export const PORT = process.env.PORT || 3000
export const DATABASE_URL = process.env.DATABASE_URL
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
export const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
export const AI_SERVICE_TIMEOUT =
  parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 30000
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const env = {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  AI_SERVICE_URL,
  AI_SERVICE_TIMEOUT,
  AI_PROVIDER,
  GEMINI_API_KEY,
  CORS_ORIGIN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
}

export default env
