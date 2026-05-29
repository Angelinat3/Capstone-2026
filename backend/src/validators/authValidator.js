import Joi from 'joi'

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Nama wajib diisi',
    'any.required': 'Nama wajib diisi'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi'
  })
})

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi'
  })
})

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email wajib diisi'
  })
})

const googleLoginSchema = Joi.object({
  access_token: Joi.string().required().messages({
    'any.required': 'Access token wajib diisi'
  })
})

const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(1).optional().messages({
    'string.empty': 'Nama tidak boleh kosong'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email tidak valid'
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password minimal 6 karakter'
  }),
  accounts: Joi.alternatives().try(
    Joi.object(),
    Joi.array(),
    Joi.allow(null)
  ).optional().messages({
    'alternatives.match': 'Accounts harus berupa object, array, atau null'
  })
})

export { registerSchema, loginSchema, forgotPasswordSchema, googleLoginSchema, updateMeSchema }
