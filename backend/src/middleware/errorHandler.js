function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message || err)

  // Handle custom exceptions
  if (err.isClientError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message
    })
  }

  // Handle validation errors from Joi
  if (err.isJoi) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi gagal',
      errors: err.details.map(e => ({ field: e.path.join('.'), message: e.message }))
    })
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'fail',
      message: 'Resource already exists'
    })
  }

  // Handle other errors
  const status = err.status || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

export default errorHandler
