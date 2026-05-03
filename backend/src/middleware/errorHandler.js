function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message || err)

  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

module.exports = errorHandler
