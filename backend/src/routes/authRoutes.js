const router = require('express').Router()
const { body } = require('express-validator')
const validate = require('../middleware/validate')
const auth = require('../middleware/auth')
const authController = require('../controllers/authController')

// POST /auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  validate,
  authController.register
)

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
  ],
  validate,
  authController.login
)

// POST /auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email tidak valid')],
  validate,
  authController.forgotPassword
)

// PUT /auth/me
router.put('/me', auth, authController.updateMe)

module.exports = router
