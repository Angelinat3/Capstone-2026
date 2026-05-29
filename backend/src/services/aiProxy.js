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
    const res = await aiClient.post('/extract-transactions', { text })
    const data = res.data
    if (data && data.transactions && data.transactions.length > 0) {
      const first = data.transactions[0]
      return {
        amount: first.amount,
        category: first.category || 'lainnya',
        merchant: first.merchant || 'Unknown',
        payMethod: first.pay_method || 'cash',
        note: first.note || text,
        type: first.type === 'income' ? 'income' : 'expense',
        confidence: first.confidence || 0.8
      }
    }
    throw new Error('Gagal mengekstrak data dari teks (FastAPI response kosong)')
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

// POST /ocr/receipt
// ================================================================
// PaddleOCR ONNX FastAPI service:
//   POST /ocr/receipt
//   Body: multipart/form-data dengan field 'file'
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
    form.append('file', fileBuffer, { filename, contentType: mimetype })

    const res = await aiClient.post('/ocr/receipt', form, {
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

// POST /predict
// ================================================================
// Endpoint untuk rekomendasi keuangan via FastAPI:
//   POST /predict
//   Body: { transactions: Array }
//   Response: { recommendations: Array of { type, icon, title, message, category, saving_estimate, id } }
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
    const mappedTransactions = transactions.map(t => ({
      user_id: t.userId || 'string',
      tanggal: t.date instanceof Date ? t.date.toISOString().split('T')[0] : new Date(t.date).toISOString().split('T')[0],
      kategori: t.category || 'lainnya',
      jumlah: typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0,
      jenis: t.type || 'expense',
      metode_pembayaran: t.payMethod || 'cash',
      profil_user: 'unknown',
      merchant: t.merchant || 'unknown',
      lokasi: 'unknown'
    }))

    const res = await aiClient.post('/predict', { transactions: mappedTransactions }, { timeout })
    const recs = res.data.recommendations || []
    return recs.map(rec => ({
      id: rec.id || String(Math.random()),
      type: rec.type || 'tip',
      icon: rec.icon || '💡',
      title: rec.title || '',
      message: rec.message || '',
      category: rec.category || '',
      savingEstimate: rec.saving_estimate || 0
    }))
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
