import prisma from '../config/prisma.js'
import NotFoundError from '../exceptions/NotFoundError.js'

const transactionRepository = {
  async findAll(userId, filters = {}) {
    const where = { userId }
    
    if (filters.type) {
      where.type = filters.type
    }
    
    if (filters.category) {
      where.category = filters.category
    }
    
    if (filters.start_date || filters.end_date) {
      where.date = {}
      if (filters.start_date) {
        where.date.gte = new Date(filters.start_date)
      }
      if (filters.end_date) {
        where.date.lte = new Date(filters.end_date)
      }
    }

    const options = {
      where,
      orderBy: { date: 'desc' }
    }

    if (filters.limit) {
      options.take = parseInt(filters.limit)
    }

    const transactions = await prisma.transaction.findMany(options)
    return transactions
  },

  async findById(id, userId) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId }
    })
    return transaction
  },

  async create(data) {
    const transaction = await prisma.transaction.create({
      data
    })
    return transaction
  },

  async delete(id, userId) {
    const result = await prisma.transaction.deleteMany({
      where: { id, userId }
    })
    
    if (result.count === 0) {
      throw new NotFoundError('Transaction not found')
    }
    
    return result
  },

  async deleteAll(userId) {
    const result = await prisma.transaction.deleteMany({
      where: { userId }
    })
    return result
  },

  async findByDateRange(userId, startDate, endDate) {
    const where = { userId }
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const transactions = await prisma.transaction.findMany({
      where
    })
    return transactions
  }
}

export default transactionRepository
