import Joi from 'joi'

const VALID_CATEGORIES = [
  'makanan', 'transport', 'belanja', 'hiburan',
  'kesehatan', 'pendidikan', 'tagihan', 'pemasukan', 'lainnya'
]

const VALID_TYPES = ['income', 'expense']

const createTransactionSchema = Joi.object({
  type: Joi.string().valid(...VALID_TYPES).required().messages({
    'any.only': 'Type harus income atau expense',
    'any.required': 'Type wajib diisi'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount harus angka positif',
    'any.required': 'Amount wajib diisi'
  }),
  category: Joi.string().valid(...VALID_CATEGORIES).required().messages({
    'any.only': 'Category tidak valid',
    'any.required': 'Category wajib diisi'
  }),
  note: Joi.string().allow('', null).optional(),
  merchant: Joi.string().allow('', null).optional(),
  date: Joi.date().required().messages({
    'any.required': 'Tanggal wajib diisi'
  }),
  payMethod: Joi.string().allow('', null).optional()
})

const getTransactionsSchema = Joi.object({
  type: Joi.string().valid(...VALID_TYPES).optional(),
  category: Joi.string().valid(...VALID_CATEGORIES).optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  limit: Joi.number().integer().positive().optional()
})

const summarySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional()
})

export { createTransactionSchema, getTransactionsSchema, summarySchema }
