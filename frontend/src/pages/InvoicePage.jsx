import { useState, useRef } from 'react'
import { Upload, FileImage, CheckCircle, Plus, RefreshCw, Bot, AlertTriangle } from 'lucide-react'
import Layout from '../components/Layout'
import { uploadInvoiceAPI } from '../services/aiService'
import { addTransactionAPI } from '../services/transactionService'
import { formatRupiah } from '../utils/helpers'

const STEPS = ['Upload Struk', 'Hasil OCR', 'Simpan']

export default function InvoicePage() {
  const [step, setStep]           = useState(0)
  const [file, setFile]           = useState(null)
  const [preview, setPreview]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [saved, setSaved]         = useState(false)
  const [editNote, setEditNote]   = useState('')
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const handleScan = async () => {
    if (!file) return
    setLoading(true)
    try {
      const result = await uploadInvoiceAPI(file)
      setOcrResult(result)
      setEditNote(result.merchant || '')
      setStep(1)
    } catch {
      alert('Gagal memproses invoice. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!ocrResult) return
    setLoading(true)
    try {
      await addTransactionAPI({
        type:     'expense',
        amount:   ocrResult.total,
        category: ocrResult.category || 'makanan',
        note:     editNote || ocrResult.merchant,
        merchant: ocrResult.merchant,
        date:     ocrResult.date,
      })
      setSaved(true)
      setStep(2)
    } catch {
      alert('Gagal menyimpan transaksi.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(0); setFile(null); setPreview(null)
    setOcrResult(null); setSaved(false); setEditNote('')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-surface-900">Scan Invoice / Struk</h1>
          <p className="text-surface-500 text-sm mt-1">Upload foto struk belanjamu, AI kami akan membaca otomatis</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-surface-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-brand-100 text-brand-700' : 'bg-surface-100'
                }`}>{i < step ? '✓' : i + 1}</div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px w-8 ${i < step ? 'bg-brand-400' : 'bg-surface-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Upload */}
        {step === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-8">
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => !file && fileRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer ${
                file ? 'border-brand-400 bg-brand-50' : 'border-surface-200 hover:border-brand-300 hover:bg-surface-50'
              }`}
            >
              {preview ? (
                <div>
                  <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-xl object-contain mb-4" />
                  <p className="text-sm font-medium text-brand-700">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); reset() }}
                    className="text-xs text-surface-400 hover:text-red-500 mt-2">Ganti foto</button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileImage size={28} className="text-brand-500" />
                  </div>
                  <p className="font-semibold text-surface-700 mb-1">Drag & drop foto struk</p>
                  <p className="text-sm text-surface-400">atau klik untuk pilih dari galeri</p>
                  <p className="text-xs text-surface-300 mt-3">JPG, PNG, WEBP — maks 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />

            <button onClick={handleScan} disabled={!file || loading}
              className="w-full mt-6 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sedang memproses...</>
                : <><Upload size={18} /> Scan Struk</>}
            </button>

            {loading && (
              <p className="text-center text-xs text-surface-400 mt-3 animate-pulse flex items-center justify-center gap-1">
                <Bot size={12} className="animate-pulse" /> AI sedang membaca struk kamu...
              </p>
            )}
          </div>
        )}

        {/* Step 1: Hasil OCR */}
        {step === 1 && ocrResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-surface-100">
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-surface-800">Hasil Pembacaan AI</h3>
                <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                  Akurasi {Math.round(ocrResult.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-50 rounded-xl p-4">
                  <p className="text-xs text-surface-400 mb-1">Merchant</p>
                  <p className="font-semibold text-surface-800">{ocrResult.merchant}</p>
                </div>
                <div className="bg-surface-50 rounded-xl p-4">
                  <p className="text-xs text-surface-400 mb-1">Tanggal</p>
                  <p className="font-semibold text-surface-800">{ocrResult.date}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-surface-400 mb-1">Total Transaksi</p>
                  <p className="font-display text-2xl font-bold text-emerald-700">{formatRupiah(ocrResult.total)}</p>
                </div>
              </div>

              {ocrResult.items?.length > 0 && (
                <div>
                  <p className="text-xs text-surface-500 font-medium mb-2">Item yang terdeteksi:</p>
                  <ul className="space-y-1">
                    {ocrResult.items.map((item, i) => (
                      <li key={i} className="text-sm text-surface-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Catatan (bisa diedit)</label>
                <input value={editNote} onChange={e => setEditNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
              </div>

              <p className="text-xs text-surface-400 bg-amber-50 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                Harap periksa kembali hasil pembacaan AI sebelum disimpan. Koreksi jika ada yang kurang tepat.
              </p>
            </div>

            <div className="p-6 border-t border-surface-100 flex gap-3">
              <button onClick={reset}
                className="flex-1 py-3 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition">
                Scan Ulang
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Plus size={16} /> Simpan Transaksi</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Sukses */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-12 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-brand-500" />
            </div>
            <h3 className="font-display text-2xl font-bold text-surface-900 mb-2">Transaksi Tersimpan!</h3>
            <p className="text-surface-500 mb-8">
              Struk dari <strong>{ocrResult?.merchant}</strong> sebesar{' '}
              <strong>{formatRupiah(ocrResult?.total)}</strong> berhasil dicatat.
            </p>
            <button onClick={reset}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl mx-auto transition">
              <RefreshCw size={16} /> Scan Struk Lain
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
