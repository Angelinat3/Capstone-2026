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
app.use(helmet())
app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

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
