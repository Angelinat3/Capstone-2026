const prisma = require('../config/prisma')
const aiProxy = require('../services/aiProxy')

function handleAIError(err, res, next) {
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({ message: 'AI Service sedang tidak tersedia' })
  }
  if (err.response) {
    return res.status(err.response.status).json({
      message: 'AI Service error',
      detail: err.response.data,
    })
  }
  next(err)
}

// POST /ai/extract-transaction
exports.extract = async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text) {
      return res.status(400).json({ message: 'Field "text" diperlukan' })
    }

    const result = await aiProxy.extractTransaction(text)
    res.json(result)
  } catch (err) {
    handleAIError(err, res, next)
  }
}

// POST /ocr/upload
exports.ocr = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File invoice diperlukan' })
    }

    const result = await aiProxy.ocrInvoice(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    res.json(result)
  } catch (err) {
    handleAIError(err, res, next)
  }
}

// GET /recommendations
exports.recommendations = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: 100,
    })

    const result = await aiProxy.getRecommendations(transactions)
    res.json(result)
  } catch (err) {
    handleAIError(err, res, next)
  }
}

// GET /predictions/price?commodity=x
exports.prediction = async (req, res, next) => {
  try {
    const { commodity } = req.query
    if (!commodity) {
      return res.status(400).json({ message: 'Query param "commodity" diperlukan' })
    }

    const result = await aiProxy.getPrediction(commodity)
    res.json(result)
  } catch (err) {
    handleAIError(err, res, next)
  }
}
