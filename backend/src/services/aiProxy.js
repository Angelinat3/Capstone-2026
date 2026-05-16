import axios from 'axios'
import FormData from 'form-data'
import { AI_SERVICE_URL, AI_SERVICE_TIMEOUT, GEMINI_API_KEY, AI_PROVIDER } from '../config/env.js'
import * as geminiService from './geminiService.js'

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: AI_SERVICE_TIMEOUT,
})

/**
 * Determine which AI provider to use
 * @returns {string} 'gemini' | 'fastapi'
 */
function getAIProvider() {
  if (AI_PROVIDER === 'gemini') return 'gemini'
  if (AI_PROVIDER === 'fastapi') return 'fastapi'
  // Auto mode: use Gemini if key exists, otherwise FastAPI
  if (GEMINI_API_KEY) return 'gemini'
  return 'fastapi'
}

// POST /ai/extract-transaction
// ================================================================
// TODO — AI ENGINEER (Tim AI):
// Jika tim AI ingin implementasi model kustom via FastAPI,
// pastikan endpoint ini tersedia di AI_SERVICE_URL:
//   POST /ai/extract-transaction
//   Body: { text: string }
//   Response: { amount, category, merchant, payMethod, note, type, confidence }
// ================================================================
async function extractTransaction(text) {
  const provider = getAIProvider()
  console.log(`[AI] extractTransaction using provider: ${provider}`)
  
  // Use Gemini
  if (provider === 'gemini') {
    return await geminiService.extractTransaction(text)
  }
  
  // Use FastAPI endpoint dari tim AI (AI_SERVICE_URL)
  try {
    const res = await aiClient.post('/ai/extract-transaction', { text })
    return res.data
  } catch (err) {
    if (err.response) {
      throw new Error(`AI Service error: ${err.response.status} - ${JSON.stringify(err.response.data)}`)
    }
    if (err.code === 'ECONNREFUSED') {
      throw new Error('AI Service (FastAPI) tidak dapat dihubungi. Pastikan service tim AI berjalan.')
    }
    if (err.code === 'ETIMEDOUT') {
      throw new Error('AI Service (FastAPI) timeout')
    }
    throw err
  }
}

// POST /ai/ocr-invoice
// ================================================================
// TODO — AI ENGINEER (Tim AI):
// Endpoint untuk OCR invoice via FastAPI:
//   POST /ai/ocr-invoice
//   Body: multipart/form-data dengan field 'invoice'
//   Response: { total, merchant, category, date, items, confidence }
// ================================================================
async function ocrInvoice(fileBuffer, filename, mimetype) {
  const provider = getAIProvider()
  console.log(`[AI] ocrInvoice using provider: ${provider}`)
  
  // Use Gemini
  if (provider === 'gemini') {
    return await geminiService.ocrInvoice(fileBuffer, filename, mimetype)
  }
  
  // Use FastAPI endpoint dari tim AI
  try {
    const form = new FormData()
    form.append('invoice', fileBuffer, { filename, contentType: mimetype })

    const res = await aiClient.post('/ai/ocr-invoice', form, {
      headers: form.getHeaders(),
      timeout: 60000,
    })
    return res.data
  } catch (err) {
    if (err.response) {
      throw new Error(`AI Service error: ${err.response.status} - ${JSON.stringify(err.response.data)}`)
    }
    if (err.code === 'ECONNREFUSED') {
      throw new Error('AI Service (FastAPI) tidak dapat dihubungi. Pastikan service tim AI berjalan.')
    }
    if (err.code === 'ETIMEDOUT') {
      throw new Error('AI Service (FastAPI) timeout')
    }
    throw err
  }
}

// POST /ai/recommendations
// ================================================================
// TODO — AI ENGINEER (Tim AI):
// Endpoint untuk rekomendasi keuangan via FastAPI:
//   POST /ai/recommendations
//   Body: { transactions: Array }
//   Response: Array of { type, title, message, category, savingEstimate }
// ================================================================
async function getRecommendations(transactions, timeout = 60000) {
  const provider = getAIProvider()
  console.log(`[AI] getRecommendations using provider: ${provider}`)
  
  // Use Gemini
  if (provider === 'gemini') {
    return await geminiService.getRecommendations(transactions)
  }
  
  // Use FastAPI endpoint dari tim AI
  try {
    const res = await aiClient.post('/ai/recommendations', { transactions }, { timeout })
    return res.data
  } catch (err) {
    if (err.response) {
      throw new Error(`AI Service error: ${err.response.status} - ${JSON.stringify(err.response.data)}`)
    }
    if (err.code === 'ECONNREFUSED') {
      throw new Error('AI Service (FastAPI) tidak dapat dihubungi. Pastikan service tim AI berjalan.')
    }
    if (err.code === 'ETIMEDOUT') {
      throw new Error('AI Service (FastAPI) timeout')
    }
    throw err
  }
}

// GET /ai/predict-price?commodity=x
// ================================================================
// TODO — AI ENGINEER (Tim AI):
// Endpoint untuk prediksi harga komoditas via FastAPI:
//   GET /ai/predict-price?commodity={commodity}
//   Response: { predictions: Array, trend, confidence }
// ================================================================
async function getPrediction(commodity) {
  try {
    const res = await aiClient.get('/ai/predict-price', {
      params: { commodity },
    })
    return res.data
  } catch (err) {
    if (err.response) {
      throw new Error(`AI Service error: ${err.response.status} - ${JSON.stringify(err.response.data)}`)
    }
    if (err.code === 'ECONNREFUSED') {
      throw new Error('AI Service tidak dapat dihubungi')
    }
    if (err.code === 'ETIMEDOUT') {
      throw new Error('AI Service timeout')
    }
    throw err
  }
}

export {
  extractTransaction,
  ocrInvoice,
  getRecommendations,
  getPrediction,
}
