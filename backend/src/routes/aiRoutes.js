import express from 'express'
import multer from 'multer'
import { extractTransactionSchema, predictionSchema } from '../validators/aiValidator.js'
import validate from '../middleware/validate.js'
import auth from '../middleware/auth.js'
import * as aiController from '../controllers/aiController.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
})

const router = express.Router()

// POST /ai/extract-transaction
router.post('/ai/extract-transaction', auth, validate(extractTransactionSchema), aiController.extract)

// POST /ocr/upload
router.post('/ocr/upload', auth, upload.single('invoice'), aiController.ocr)

// GET /recommendations
router.get('/recommendations', auth, aiController.recommendations)

// GET /predictions/price?commodity=x
router.get('/predictions/price', auth, validate(predictionSchema, 'query'), aiController.prediction)

export default router
