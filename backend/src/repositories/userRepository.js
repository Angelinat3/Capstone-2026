import prisma from '../config/prisma.js'
import InvariantError from '../exceptions/InvariantError.js'
import NotFoundError from '../exceptions/NotFoundError.js'

const userRepository = {
  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return user
  },

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return user
  },

  async create(data) {
    const existingUser = await this.findByEmail(data.email)
    if (existingUser) {
      throw new InvariantError('Email already registered')
    }

    const user = await prisma.user.create({
      data
    })
    return user
  },

  async update(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data
    })
    return user
  },

  async updateAvatar(id, avatarUrl) {
    const user = await prisma.user.update({
      where: { id },
      data: { avatarUrl }
    })
    return user
  },

  async linkGoogleAccount(email, googleId, avatarUrl) {
    const user = await prisma.user.update({
      where: { email },
      data: { googleId, avatarUrl }
    })
    return user
  },

  async updateAvatarUrl(email, avatarUrl) {
    const user = await prisma.user.update({
      where: { email },
      data: { avatarUrl }
    })
    return user
  }
}

export default userRepository
