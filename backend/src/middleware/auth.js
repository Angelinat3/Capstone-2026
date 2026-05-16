import jwt from 'jsonwebtoken'
import {JWT_SECRET}  from '../config/env.js'
import AuthenticationError from '../exceptions/AuthenticationError.js'

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthenticationError('Token tidak ditemukan')
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token sudah expired')
    }
    if (err.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Token tidak valid')
    }
    throw new AuthenticationError('Token tidak valid atau sudah expired')
  }
}

export default auth
