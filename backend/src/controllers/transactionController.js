const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// GET /transactions
exports.getAll = async (req, res, next) => {
  try {
    const { type, category, start_date, end_date, limit } = req.query

    const where = { userId: req.user.id }
    if (type) where.type = type
    if (category) where.category = category
    if (start_date || end_date) {
      where.date = {}
      if (start_date) where.date.gte = new Date(start_date)
      if (end_date) where.date.lte = new Date(end_date)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      ...(limit && { take: parseInt(limit) }),
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

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseInt(amount),
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

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    })

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' })
    }

    await prisma.transaction.delete({ where: { id } })
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

    let totalIncome = 0
    let totalExpense = 0
    const categoryMap = {}

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount
      } else {
        totalExpense += tx.amount
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
      }
    }

    const byCategory = Object.entries(categoryMap).map(([category, total]) => ({
      category,
      total,
    }))

    res.json({
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      by_category: byCategory,
    })
  } catch (err) {
    next(err)
  }
}
