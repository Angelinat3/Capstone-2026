import api from './api'
import { DUMMY_REKOMENDASI, DUMMY_PREDIKSI } from '../utils/dummyData'

const USE_DUMMY = false

function unwrapSuccess(res) {
  const body = res?.data
  if (body && typeof body === 'object' && body.data !== undefined) {
    return body.data
  }
  return body
}

export async function extractTransactionAPI(text) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 1500))
    return {
      amount: 25000,
      category: 'makanan',
      merchant: 'Kopi Kenangan',
      payMethod: 'gopay',
      note: text,
      type: 'expense',
      confidence: 0.92,
    }
  }
  const res = await api.post('/ai/extract-transaction', { text })
  return unwrapSuccess(res)
}

export async function uploadInvoiceAPI(file) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 2000))
    return {
      merchant: 'Indomaret',
      date: new Date().toISOString().split('T')[0],
      total: 45500,
      items: ['Indomie Goreng x2', 'Teh Botol x1', 'Chitato x1'],
      category: 'makanan',
      confidence: 0.91,
    }
  }
  const formData = new FormData()
  formData.append('invoice', file)
  const res = await api.post('/ocr/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapSuccess(res)
}

export async function getRekomendasiAPI() {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 600))
    return DUMMY_REKOMENDASI
  }
  const res = await api.get('/recommendations')
  const data = unwrapSuccess(res)
  return Array.isArray(data) ? data : data?.recommendations ?? []
}

export async function getPrediksiHargaAPI(komoditas = 'beras') {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 700))
    return DUMMY_PREDIKSI[komoditas] || DUMMY_PREDIKSI['beras']
  }
  const res = await api.get(`/predictions/price?commodity=${komoditas}`)
  return unwrapSuccess(res)
}
