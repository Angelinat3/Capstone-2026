import api from './api'
import { DUMMY_REKOMENDASI, DUMMY_PREDIKSI } from '../utils/dummyData'

const USE_DUMMY = false

// ================================================================
// Extract Transaction from Text
// Backend akan route ke Gemini atau FastAPI (tim AI) berdasarkan config
// Endpoint backend: POST /ai/extract-transaction
// 
// NOTE: Jika tim AI ingin ganti endpoint ke FastAPI langsung,
// ganti url di bawah jadi: 'http://localhost:8000/ai/extract-transaction'
// ================================================================
export async function extractTransactionAPI(text) {
  if (USE_DUMMY) {
    // Simulasi hasil ekstrak dari text
    await new Promise(r => setTimeout(r, 1500))
    return {
      amount:     25000,
      category:   'makanan',
      merchant:   'Kopi Kenangan',
      payMethod:  'gopay',
      note:       text,
      type:       'expense',
      confidence: 0.92,
    }
  }
  // Backend akan route ke Gemini atau FastAPI berdasarkan AI_PROVIDER config
  const res = await api.post('/ai/extract-transaction', { text })
  return res.data
}

// ================================================================
// OCR Invoice
// ================================================================
export async function uploadInvoiceAPI(file) {
  if (USE_DUMMY) {
    // Simulasi hasil OCR dari gambar struk
    await new Promise(r => setTimeout(r, 2000))
    return {
      merchant:  'Indomaret',
      date:       new Date().toISOString().split('T')[0],
      total:      45500,
      items:      ['Indomie Goreng x2', 'Teh Botol x1', 'Chitato x1'],
      category:   'makanan',
      confidence: 0.91,
    }
  }
  const formData = new FormData()
  formData.append('invoice', file)
  const res = await api.post('/ocr/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ================================================================
// Rekomendasi AI
// ================================================================
export async function getRekomendasiAPI() {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 600))
    return DUMMY_REKOMENDASI
  }
  const res = await api.get('/recommendations')
  return res.data
}

// ================================================================
// Prediksi Harga Sembako
// ================================================================
export async function getPrediksiHargaAPI(komoditas = 'beras') {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 700))
    return DUMMY_PREDIKSI[komoditas] || DUMMY_PREDIKSI['beras']
  }
  const res = await api.get(`/predictions/price?commodity=${komoditas}`)
  return res.data
}
