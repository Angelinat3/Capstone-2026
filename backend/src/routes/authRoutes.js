const router = require('express').Router()
const { body } = require('express-validator')
const validate = require('../middleware/validate')
const auth = require('../middleware/auth')
const authController = require('../controllers/authController')
const upload = require('../config/multer')

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

// POST /auth/google
router.post(
  '/google',
  [body('access_token').notEmpty().withMessage('Access token wajib diisi')],
  validate,
  authController.googleLogin
)

// PUT /auth/me
router.put(
  '/me',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
    body('accounts').optional().custom(value => {
      if (value === null) return true
      if (typeof value === 'object' && !Array.isArray(value)) return true
      if (Array.isArray(value)) return true
      throw new Error('Accounts harus berupa object, array, atau null')
    }),
  ],
  validate,
  authController.updateMe
)

// POST /auth/avatar
router.post(
  '/avatar',
  auth,
  upload.single('avatar'),
  authController.uploadAvatar
)

// DELETE /auth/avatar
router.delete(
  '/avatar',
  auth,
  authController.deleteAvatar
)

module.exports = router
