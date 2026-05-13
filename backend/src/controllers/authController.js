const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const axios = require('axios')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env')
const fs = require('fs')
const path = require('path')

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

function sanitizeUser(user) {
  const { password, ...rest } = user
  return rest
}

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    const token = signToken(user)
    res.status(201).json({ token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const token = signToken(user)
    res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

// POST /auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.json({ message: 'Jika email terdaftar, link reset password telah dikirim' })
    }

    res.status(501).json({ message: 'Fitur reset password belum diimplementasi' })
  } catch (err) {
    next(err)
  }
}

// PUT /auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, accounts } = req.body

    const data = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Nama tidak valid' })
      }
      data.name = name.trim()
    }
    if (accounts !== undefined) {
      if (accounts !== null && typeof accounts !== 'object') {
        return res.status(400).json({ message: 'Accounts harus berupa object, array, atau null' })
      }
      data.accounts = accounts
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    })

    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

// POST /auth/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' })
    }

    // Delete old avatar if exists
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatarUrl)
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath)
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    })

    res.json({ user: sanitizeUser(updatedUser) })
  } catch (err) {
    next(err)
  }
}

// DELETE /auth/avatar
exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })

    if (!user.avatarUrl) {
      return res.status(404).json({ message: 'Tidak ada foto profil yang dihapus' })
    }

    // Delete file from filesystem if it's a local file
    if (user.avatarUrl.startsWith('/uploads/avatars/')) {
      const avatarPath = path.join(__dirname, '../../', user.avatarUrl)
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
      }
    }

    // Update user to remove avatar URL
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: null },
    })

    res.json({ user: sanitizeUser(updatedUser) })
  } catch (err) {
    next(err)
  }
}

// POST /auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { access_token } = req.body

    // Fetch user info from Google using access token
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const { email, name, sub: googleId, picture: avatarUrl } = response.data

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatarUrl,
          password: '', // No password for Google users
        },
      })
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { email },
        data: { googleId, avatarUrl },
      })
    } else {
      // Returning Google user - update avatarUrl in case it changed
      user = await prisma.user.update({
        where: { email },
        data: { avatarUrl },
      })
    }

    const token = signToken(user)
    res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    console.error('Google login error:', err)
    next(err)
  }
}
