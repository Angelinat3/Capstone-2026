const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const axios = require('axios')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env')

const prisma = new PrismaClient()

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
      // Tetap return success agar tidak bocorkan info email terdaftar atau tidak
      return res.json({ message: 'Jika email terdaftar, link reset password telah dikirim' })
    }

    // TODO: Implementasi kirim email reset password (nodemailer / email service)

    res.json({ message: 'Jika email terdaftar, link reset password telah dikirim' })
  } catch (err) {
    next(err)
  }
}

// PUT /auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, accounts } = req.body

    const data = {}
    if (name !== undefined) data.name = name
    if (accounts !== undefined) data.accounts = accounts

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    })

    res.json({ user: sanitizeUser(user) })
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
    }

    const token = signToken(user)
    res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    console.error('Google login error:', err)
    next(err)
  }
}
