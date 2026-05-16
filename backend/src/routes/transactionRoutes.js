import express from 'express'
import { createTransactionSchema, getTransactionsSchema, summarySchema } from '../validators/transactionValidator.js'
import validate from '../middleware/validate.js'
import auth from '../middleware/auth.js'
import * as txController from '../controllers/transactionController.js'

const router = express.Router()

// GET /transactions
router.get('/', auth, txController.getAll)

// POST /transactions
router.post(
  '/',
  auth,
  validate(createTransactionSchema),
  txController.create
)

// DELETE /transactions/:id
router.delete('/:id', auth, txController.deleteTransaction)

// GET /transactions/summary
router.get('/summary', auth, validate(summarySchema, 'query'), txController.summary)

export default router
