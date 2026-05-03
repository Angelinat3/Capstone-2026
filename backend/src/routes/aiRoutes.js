const router = require('express').Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const aiController = require('../controllers/aiController')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
})

// POST /ai/extract-transaction
router.post('/ai/extract-transaction', auth, aiController.extract)

// POST /ocr/upload
router.post('/ocr/upload', auth, upload.single('invoice'), aiController.ocr)

// GET /recommendations
router.get('/recommendations', auth, aiController.recommendations)

// GET /predictions/price?commodity=x
router.get('/predictions/price', auth, aiController.prediction)

module.exports = router
