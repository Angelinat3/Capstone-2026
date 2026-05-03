import api from './api'
import { DUMMY_REKOMENDASI, DUMMY_PREDIKSI } from '../utils/dummyData'

const USE_DUMMY = false

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
