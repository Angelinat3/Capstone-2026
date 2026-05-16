import { Decimal } from '@prisma/client/runtime/library.js'
import transactionRepository from '../repositories/transactionRepository.js'
import InvariantError from '../exceptions/InvariantError.js'

// GET /transactions
export const getAll = async (req, res, next) => {
  try {
    const { type, category, start_date, end_date, limit } = req.query

    const filters = { userId: req.user.id }
    if (type) filters.type = type
    if (category) filters.category = category
    if (start_date) filters.start_date = start_date
    if (end_date) filters.end_date = end_date
    if (limit) filters.limit = limit

    const transactions = await transactionRepository.findAll(req.user.id, filters)

    res.json({
      status: 'success',
      message: 'Transaksi berhasil diambil',
      data: { transactions }
    })
  } catch (err) {
    next(err)
  }
}

// POST /transactions
export const create = async (req, res, next) => {
  try {
    const { type, amount, category, note, merchant, date, payMethod } = req.body

    // Sanitize amount: remove unit suffixes and convert to clean number
    let cleanAmount = amount
    if (typeof amount === 'string') {
      // Remove common Indonesian unit suffixes
      cleanAmount = amount
        .toLowerCase()
        .replace(/[.,\s]/g, '') // Remove dots, commas, spaces
        .replace(/rb|ribu|k|juta|milyar/g, '') // Remove unit suffixes
      cleanAmount = parseFloat(cleanAmount) || 0
    } else {
      cleanAmount = parseFloat(amount) || 0
    }

    // Validate amount is a valid positive number
    if (isNaN(cleanAmount) || cleanAmount < 0) {
      throw new InvariantError('Amount harus berupa angka positif yang valid')
    }

    const transaction = await transactionRepository.create({
      type,
      amount: new Decimal(cleanAmount),
      category,
      note: note || null,
      merchant: merchant || null,
      date: new Date(date),
      payMethod: payMethod || 'cash',
      userId: req.user.id,
    })

    res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil dibuat',
      data: { transaction }
    })
  } catch (err) {
    next(err)
  }
}

// DELETE /transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params

    await transactionRepository.delete(id, req.user.id)

    res.json({
      status: 'success',
      message: 'Transaksi berhasil dihapus'
    })
  } catch (err) {
    next(err)
  }
}

// GET /transactions/summary
export const summary = async (req, res, next) => {
  try {
    const { month, year } = req.query

    let startDate, endDate
    if (month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    }

    const transactions = await transactionRepository.findByDateRange(
      req.user.id,
      startDate,
      endDate
    )

    let totalIncome = new Decimal(0)
    let totalExpense = new Decimal(0)
    const categoryMap = {}

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome = totalIncome.plus(tx.amount)
      } else {
        totalExpense = totalExpense.plus(tx.amount)
        categoryMap[tx.category] = (categoryMap[tx.category] || new Decimal(0)).plus(tx.amount)
      }
    }

    const byCategory = Object.entries(categoryMap).map(([category, total]) => ({
      category,
      total: total.toString(),
    }))

    res.json({
      status: 'success',
      message: 'Ringkasan transaksi berhasil diambil',
      data: {
        total_income: totalIncome.toString(),
        total_expense: totalExpense.toString(),
        balance: totalIncome.minus(totalExpense).toString(),
        by_category: byCategory,
      }
    })
  } catch (err) {
    next(err)
  }
}
