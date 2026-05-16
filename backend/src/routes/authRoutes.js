import express from 'express'
import { registerSchema, loginSchema, forgotPasswordSchema, googleLoginSchema, updateMeSchema } from '../validators/authValidator.js'
import validate from '../middleware/validate.js'
import auth from '../middleware/auth.js'
import * as authController from '../controllers/authController.js'
import upload from '../config/multer.js'

const router = express.Router()

// POST /auth/register
router.post(
  '/register',
  validate(registerSchema),
  authController.register
)

// POST /auth/login
router.post(
  '/login',
  validate(loginSchema),
  authController.login
)

// POST /auth/forgot-password
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

// POST /auth/google
router.post(
  '/google',
  validate(googleLoginSchema),
  authController.googleLogin
)

// PUT /auth/me
router.put(
  '/me',
  auth,
  validate(updateMeSchema),
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

export default router
