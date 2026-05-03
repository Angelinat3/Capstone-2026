const axios = require('axios')
const FormData = require('form-data')
const { AI_SERVICE_URL, AI_SERVICE_TIMEOUT } = require('../config/env')

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: AI_SERVICE_TIMEOUT,
})

// POST /ai/extract-transaction
async function extractTransaction(text) {
  const res = await aiClient.post('/ai/extract-transaction', { text })
  return res.data
}

// POST /ai/ocr-invoice
async function ocrInvoice(fileBuffer, filename, mimetype) {
  const form = new FormData()
  form.append('invoice', fileBuffer, { filename, contentType: mimetype })

  const res = await aiClient.post('/ai/ocr-invoice', form, {
    headers: form.getHeaders(),
    timeout: 60000,
  })
  return res.data
}

// POST /ai/recommendations
async function getRecommendations(transactions) {
  const res = await aiClient.post('/ai/recommendations', { transactions })
  return res.data
}

// GET /ai/predict-price?commodity=x
async function getPrediction(commodity) {
  const res = await aiClient.get('/ai/predict-price', {
    params: { commodity },
  })
  return res.data
}

module.exports = {
  extractTransaction,
  ocrInvoice,
  getRecommendations,
  getPrediction,
}
