const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/env')

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah expired' })
  }
}

module.exports = auth
