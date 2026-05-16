import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PORT, CORS_ORIGIN } from './config/env.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

const app = express()

// Global Middleware
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

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is healthy',
    data: { timestamp: new Date().toISOString() }
  })
})

// Routes 
app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)
app.use('/', aiRoutes)

// 404 
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
  })
})

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler)

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[DompetKuy Backend] Server berjalan di http://localhost:${PORT}`)
})

export default app
