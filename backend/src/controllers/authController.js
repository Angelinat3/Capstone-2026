import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import {JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js'
import userRepository from '../repositories/userRepository.js'
import AuthenticationError from '../exceptions/AuthenticationError.js'
import InvariantError from '../exceptions/InvariantError.js'
import NotFoundError from '../exceptions/NotFoundError.js'

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
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const hashed = await bcrypt.hash(password, 12)
    const user = await userRepository.create({
      name,
      email,
      password: hashed,
    })

    const token = signToken(user)
    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: { token, user: sanitizeUser(user) }
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new AuthenticationError('Email atau password salah')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new AuthenticationError('Email atau password salah')
    }

    const token = signToken(user)
    res.json({
      status: 'success',
      message: 'Login berhasil',
      data: { token, user: sanitizeUser(user) }
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await userRepository.findByEmail(email)
    if (!user) {
      return res.json({
        status: 'success',
        message: 'Jika email terdaftar, link reset password telah dikirim'
      })
    }

    throw new InvariantError('Fitur reset password belum diimplementasi')
  } catch (err) {
    next(err)
  }
}

// PUT /auth/me
export const updateMe = async (req, res, next) => {
  try {
    const { name, accounts } = req.body

    const data = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new InvariantError('Nama tidak valid')
      }
      data.name = name.trim()
    }
    if (accounts !== undefined) {
      if (accounts !== null && typeof accounts !== 'object') {
        throw new InvariantError('Accounts harus berupa object, array, atau null')
      }
      data.accounts = accounts
    }

    const user = await userRepository.update(req.user.id, data)

    res.json({
      status: 'success',
      message: 'Profil berhasil diperbarui',
      data: { user: sanitizeUser(user) }
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new InvariantError('Tidak ada file yang diunggah')
    }

    // Delete old avatar if exists
    const user = await userRepository.findById(req.user.id)
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), user.avatarUrl)
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath)
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    const updatedUser = await userRepository.updateAvatar(req.user.id, avatarUrl)

    res.json({
      status: 'success',
      message: 'Avatar berhasil diunggah',
      data: { user: sanitizeUser(updatedUser) }
    })
  } catch (err) {
    next(err)
  }
}

// DELETE /auth/avatar
export const deleteAvatar = async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user.id)

    if (!user.avatarUrl) {
      throw new NotFoundError('Tidak ada foto profil yang dihapus')
    }

    // Delete file from filesystem if it's a local file
    if (user.avatarUrl.startsWith('/uploads/avatars/')) {
      const avatarPath = path.join(process.cwd(), user.avatarUrl)
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
      }
    }

    // Update user to remove avatar URL
    const updatedUser = await userRepository.updateAvatar(req.user.id, null)

    res.json({
      status: 'success',
      message: 'Avatar berhasil dihapus',
      data: { user: sanitizeUser(updatedUser) }
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/google
export const googleLogin = async (req, res, next) => {
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
    let user = await userRepository.findByEmail(email)

    if (!user) {
      // Create new user if doesn't exist
      user = await userRepository.create({
        email,
        name,
        googleId,
        avatarUrl,
        password: '', // No password for Google users
      })
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await userRepository.linkGoogleAccount(email, googleId, avatarUrl)
    } else {
      // Returning Google user - update avatarUrl in case it changed
      user = await userRepository.updateAvatarUrl(email, avatarUrl)
    }

    const token = signToken(user)
    res.json({
      status: 'success',
      message: 'Login dengan Google berhasil',
      data: { token, user: sanitizeUser(user) }
    })
  } catch (err) {
    console.error('Google login error:', err)
    next(err)
  }
}
