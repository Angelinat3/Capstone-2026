const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { PORT, CORS_ORIGIN } = require('./config/env')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/authRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const aiRoutes = require('./routes/aiRoutes')

const app = express()

// ── Global Middleware ──────────────────────────────────────
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}))
app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static('uploads'))

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)
app.use('/', aiRoutes)

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} tidak ditemukan` })
})

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler)

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[DompetKuy Backend] Server berjalan di http://localhost:${PORT}`)
})

module.exports = app
