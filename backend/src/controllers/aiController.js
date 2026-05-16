import transactionRepository from '../repositories/transactionRepository.js'
import * as aiProxy from '../services/aiProxy.js'
import InvariantError from '../exceptions/InvariantError.js'

function handleAIError(err, res, next) {
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    throw new InvariantError('AI Service sedang tidak tersedia')
  }
  if (err.response) {
    throw new InvariantError('AI Service error')
  }
  next(err)
}

// POST /ai/extract-transaction
export const extract = async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text) {
      throw new InvariantError('Field "text" diperlukan')
    }

    const result = await aiProxy.extractTransaction(text)
    res.json({
      status: 'success',
      message: 'Ekstraksi transaksi berhasil',
      data: result
    })
  } catch (err) {
    handleAIError(err, res, next)
  }
}

// POST /ocr/upload
export const ocr = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new InvariantError('File invoice diperlukan')
    }

    const result = await aiProxy.ocrInvoice(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    res.json({
      status: 'success',
      message: 'OCR berhasil',
      data: result
    })
  } catch (err) {
    handleAIError(err, res, next)
  }
}

// GET /recommendations
export const recommendations = async (req, res, next) => {
  try {
    const transactions = await transactionRepository.findAll(req.user.id, { limit: 100 })

    const result = await aiProxy.getRecommendations(transactions)
    res.json({
      status: 'success',
      message: 'Rekomendasi berhasil diambil',
      data: result
    })
  } catch (err) {
    handleAIError(err, res, next)
  }
}

// GET /predictions/price?commodity=x
export const prediction = async (req, res, next) => {
  try {
    const { commodity } = req.query
    if (!commodity) {
      throw new InvariantError('Query param "commodity" diperlukan')
    }

    const result = await aiProxy.getPrediction(commodity)
    res.json({
      status: 'success',
      message: 'Prediksi harga berhasil diambil',
      data: result
    })
  } catch (err) {
    handleAIError(err, res, next)
  }
}
