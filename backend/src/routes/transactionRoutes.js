const router = require('express').Router()
const { body } = require('express-validator')
const validate = require('../middleware/validate')
const auth = require('../middleware/auth')
const txController = require('../controllers/transactionController')

const VALID_CATEGORIES = [
  'makanan', 'transport', 'belanja', 'hiburan',
  'kesehatan', 'pendidikan', 'tagihan', 'pemasukan', 'lainnya',
]

const VALID_TYPES = ['income', 'expense']

// GET /transactions
router.get('/', auth, txController.getAll)

// POST /transactions
router.post(
  '/',
  auth,
  [
    body('type').isIn(VALID_TYPES).withMessage('Type harus income atau expense'),
    body('amount').isInt({ min: 1 }).withMessage('Amount harus angka positif'),
    body('category').isIn(VALID_CATEGORIES).withMessage('Category tidak valid'),
    body('date').notEmpty().withMessage('Tanggal wajib diisi'),
  ],
  validate,
  txController.create
)

// DELETE /transactions/:id
router.delete('/:id', auth, txController.delete)

// GET /transactions/summary
router.get('/summary', auth, txController.summary)

module.exports = router
