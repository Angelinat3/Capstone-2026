const prisma = require('../config/prisma')
const { Decimal } = require('@prisma/client/runtime/library')

// GET /transactions
exports.getAll = async (req, res, next) => {
  try {
    const { type, category, start_date, end_date, limit } = req.query

    const where = { userId: req.user.id }
    if (type) where.type = type
    if (category) where.category = category
    if (start_date || end_date) {
      where.date = {}
      if (start_date) {
        const startDate = new Date(start_date)
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: 'start_date tidak valid' })
        }
        where.date.gte = startDate
      }
      if (end_date) {
        const endDate = new Date(end_date)
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'end_date tidak valid' })
        }
        where.date.lte = endDate
      }
    }

    let takeLimit
    if (limit) {
      takeLimit = parseInt(limit)
      if (isNaN(takeLimit) || takeLimit < 1) {
        return res.status(400).json({ message: 'limit harus berupa angka positif' })
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      ...(takeLimit && { take: takeLimit }),
    })

    res.json(transactions)
  } catch (err) {
    next(err)
  }
}

// POST /transactions
exports.create = async (req, res, next) => {
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
      return res.status(400).json({ message: 'Amount harus berupa angka positif yang valid' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: new Decimal(cleanAmount),
        category,
        note: note || null,
        merchant: merchant || null,
        date: new Date(date),
        payMethod: payMethod || 'cash',
        userId: req.user.id,
      },
    })

    res.status(201).json(transaction)
  } catch (err) {
    next(err)
  }
}

// DELETE /transactions/:id
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await prisma.transaction.deleteMany({
      where: { id, userId: req.user.id },
    })

    if (result.count === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' })
    }

    res.json({ message: 'Transaksi berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

// GET /transactions/summary
exports.summary = async (req, res, next) => {
  try {
    const { month, year } = req.query

    const where = { userId: req.user.id }
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.date = { gte: start, lte: end }
    }

    const transactions = await prisma.transaction.findMany({ where })

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
      total_income: totalIncome.toString(),
      total_expense: totalExpense.toString(),
      balance: totalIncome.minus(totalExpense).toString(),
      by_category: byCategory,
    })
  } catch (err) {
    next(err)
  }
}
