import Joi from 'joi'

const extractTransactionSchema = Joi.object({
  text: Joi.string().required().messages({
    'any.required': 'Field "text" diperlukan'
  })
})

const predictionSchema = Joi.object({
  commodity: Joi.string().required().messages({
    'any.required': 'Query param "commodity" diperlukan'
  })
})

export { extractTransactionSchema, predictionSchema }
