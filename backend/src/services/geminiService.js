const { GoogleGenAI } = require('@google/genai')
const { GEMINI_API_KEY } = require('../config/env')

// Valid categories for transaction extraction
const VALID_CATEGORIES = [
  'makanan', 'transport', 'belanja', 'hiburan', 
  'kesehatan', 'pendidikan', 'tagihan', 'pemasukan', 'lainnya'
]

// Valid payment methods
const VALID_PAYMENT_METHODS = [
  'cash', 'gopay', 'ovo', 'dana', 'shopeepay', 
  'bca', 'bni', 'mandiri', 'bri', 'bsi', 'cc_visa'
]

// Models to try in order (fallback mechanism)
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

/**
 * Try to generate content with fallback models
 * @param {Array} contents - Content array for Gemini
 * @param {Object} config - Generation config
 * @returns {Promise<Object>} - Gemini response
 */
async function generateWithFallback(contents, config) {
  let lastError = null
  
  for (const model of MODELS) {
    try {
      console.log(`[Gemini] Trying model: ${model}`)
      const result = await genAI.models.generateContent({
        model,
        contents,
        config
      })
      console.log(`[Gemini] Success with model: ${model}`)
      return result
    } catch (err) {
      lastError = err
      console.warn(`[Gemini] Model ${model} failed:`, err.message)
      
      // If it's a 503/unavailable error, try next model
      if (err.status === 503 || err.code === 503 || err.message?.includes('UNAVAILABLE')) {
        continue
      }
      // For other errors, throw immediately
      throw err
    }
  }
  
  // All models failed
  throw lastError || new Error('All Gemini models unavailable')
}

/**
 * Extract transaction data from natural language text using Gemini
 * @param {string} text - User input text (e.g., "beli kopi 25rb pakai GoPay di Kenangan")
 * @returns {Promise<Object>} - Extracted transaction data
 */
async function extractTransaction(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const schema = {
    type: 'object',
    properties: {
      amount: {
        type: 'integer',
        description: 'Nominal transaksi dalam Rupiah (number only, no decimals). Contoh: 25000, 1500000'
      },
      category: {
        type: 'string',
        enum: VALID_CATEGORIES,
        description: 'Kategori transaksi'
      },
      merchant: {
        type: 'string',
        description: 'Nama toko/merchant/judul transaksi'
      },
      payMethod: {
        type: 'string',
        enum: VALID_PAYMENT_METHODS,
        description: 'Metode pembayaran yang digunakan'
      },
      note: {
        type: 'string',
        description: 'Catatan tambahan tentang transaksi'
      },
      type: {
        type: 'string',
        enum: ['expense', 'income'],
        description: 'Tipe transaksi: expense (pengeluaran) atau income (pemasukan)'
      },
      confidence: {
        type: 'number',
        description: 'Confidence score dari 0.0 sampai 1.0'
      }
    },
    required: ['amount', 'category', 'merchant', 'payMethod', 'note', 'type', 'confidence']
  }

  const prompt = `Ekstrak data transaksi dari text berikut dalam bahasa Indonesia:

"${text}"

Extract fields:
- amount: Nominal dalam angka bulat Rupiah (contoh: 25000 untuk "25rb")
- category: Pilih dari [makanan, transport, belanja, hiburan, kesehatan, pendidikan, tagihan, pemasukan, lainnya]
- merchant: Nama tempat/toko/judul
- payMethod: Pilih dari [cash, gopay, ovo, dana, shopeepay, bca, bni, mandiri, bri, bsi, cc_visa]
- note: Deskripsi singkat transaksi
- type: "expense" untuk pengeluaran, "income" untuk pemasukan
- confidence: Tingkat kepercayaan 0.0-1.0

Contoh input: "gaji bulanan 5jt masuk"
Contoh output: {"amount": 5000000, "category": "pemasukan", "merchant": "Perusahaan", "payMethod": "bca", "note": "Gaji bulanan", "type": "income", "confidence": 0.95}`

  try {
    const result = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
      responseSchema: schema
    })

    const parsed = JSON.parse(result.text)
    
    // Validate and sanitize
    if (!parsed.amount || parsed.amount < 100) {
      throw new Error('Could not extract valid amount')
    }

    return {
      amount: parsed.amount,
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'lainnya',
      merchant: parsed.merchant || 'Unknown',
      payMethod: VALID_PAYMENT_METHODS.includes(parsed.payMethod) ? parsed.payMethod : 'cash',
      note: parsed.note || text,
      type: parsed.type === 'income' ? 'income' : 'expense',
      confidence: parsed.confidence || 0.8
    }
  } catch (err) {
    console.error('Gemini extraction error:', err.message)
    
    // Check if it's a 503/high demand error
    if (err.status === 503 || err.code === 503 || err.message?.includes('UNAVAILABLE')) {
      throw new Error('AI service sedang sibuk. Coba lagi dalam beberapa saat.')
    }
    throw new Error('Gagal mengekstrak data dari teks')
  }
}

/**
 * Get AI recommendations based on user's transaction history
 * @param {Array} transactions - User's transaction history
 * @returns {Promise<Array>} - Array of recommendations
 */
async function getRecommendations(transactions) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const prompt = `Berdasarkan data transaksi pengguna berikut, berikan 3-4 rekomendasi keuangan personal dalam bahasa Indonesia yang actionable dan spesifik.

Data transaksi (100 terakhir):
${JSON.stringify(transactions.slice(0, 20), null, 2)}

Format respons sebagai JSON array dengan struktur:
[{
  "type": "warning|tip|alert|good",
  "title": "Judul rekomendasi",
  "message": "Pesan detail dengan saran konkret",
  "category": "kategori terkait",
  "savingEstimate": 50000  // estimasi penghematan dalam Rupiah (number)
}]

Beri insight yang personal dan berguna, jangan generik.`

  try {
    const result = await generateWithFallback(prompt, {
      responseMimeType: 'application/json'
    })

    return JSON.parse(result.text)
  } catch (err) {
    console.error('Gemini recommendations error:', err.message)
    
    // Check if it's a 503/high demand error
    if (err.status === 503 || err.code === 503 || err.message?.includes('UNAVAILABLE')) {
      throw new Error('AI service sedang sibuk. Coba lagi dalam beberapa saat.')
    }
    throw new Error('Gagal mendapatkan rekomendasi')
  }
}

/**
 * OCR Invoice using Gemini Vision
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - File mime type
 * @returns {Promise<Object>} - Extracted invoice data
 */
async function ocrInvoice(fileBuffer, filename, mimetype) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const schema = {
    type: 'object',
    properties: {
      total: {
        type: 'integer',
        description: 'Total amount in Rupiah'
      },
      merchant: {
        type: 'string',
        description: 'Merchant/store name'
      },
      category: {
        type: 'string',
        enum: VALID_CATEGORIES,
        description: 'Transaction category'
      },
      date: {
        type: 'string',
        description: 'Transaction date in YYYY-MM-DD format'
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'number' },
            price: { type: 'integer' }
          }
        }
      },
      confidence: {
        type: 'number',
        description: 'Confidence score 0.0-1.0'
      }
    },
    required: ['total', 'merchant', 'category', 'date', 'confidence']
  }

  try {
    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64')
    
    const result = await generateWithFallback([
      {
        text: `Extract transaction information from this invoice/receipt image.
        Return JSON with: total (amount in Rupiah), merchant (store name), 
        category (choose from: ${VALID_CATEGORIES.join(', ')}), 
        date (YYYY-MM-DD format), items (array of purchased items if visible), 
        and confidence score.`
      },
      {
        inlineData: {
          mimeType: mimetype,
          data: base64Image
        }
      }
    ], {
      responseMimeType: 'application/json',
      responseSchema: schema
    })

    const parsed = JSON.parse(result.text)
    
    return {
      total: parsed.total || 0,
      merchant: parsed.merchant || 'Unknown',
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'lainnya',
      date: parsed.date || new Date().toISOString().split('T')[0],
      items: parsed.items || [],
      confidence: parsed.confidence || 0.7
    }
  } catch (err) {
    console.error('Gemini OCR error:', err.message)
    
    // Check if it's a 503/high demand error
    if (err.status === 503 || err.code === 503 || err.message?.includes('UNAVAILABLE')) {
      throw new Error('AI service sedang sibuk. Coba upload lagi dalam beberapa saat.')
    }
    throw new Error('Gagal membaca invoice')
  }
}

module.exports = {
  extractTransaction,
  getRecommendations,
  ocrInvoice
}
