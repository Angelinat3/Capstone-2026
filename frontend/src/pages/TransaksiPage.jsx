import { useState, useEffect, useRef } from 'react'
import { Send, Camera, Trash2, X, Check, Loader, Sparkles, Bot, List, DollarSign } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import AnimatedPage from '../components/AnimatedPage'
import { getTransactionsAPI, addTransactionAPI, deleteTransactionAPI } from '../services/transactionService'
import { uploadInvoiceAPI, extractTransactionAPI } from '../services/aiService'
import { CATEGORIES } from '../utils/dummyData'
import { formatRupiah, formatTanggalPendek, getCategoryInfo } from '../utils/helpers'
import { ALL_PAYMENTS, PAYMENT_GROUPS, PayLogo, getPayment } from '../utils/paymentMethods'

// ── AI Extraction using Backend Gemini API ──────────
async function extractFromAI(text) {
  const result = await extractTransactionAPI(text)
  return result
}

// ── Extracted form component ────────────────────────────────
function ExtractedForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState({ ...data })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [showPayPicker, setShowPayPicker] = useState(false)
  const filteredCats = CATEGORIES.filter(c => form.type === 'income' ? c.id === 'pemasukan' : c.id !== 'pemasukan')
  const selectedPay  = getPayment(form.payMethod)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-800 border border-primary-100 dark:border-primary-800 rounded-2xl rounded-bl-sm overflow-hidden shadow-soft"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 px-4 py-2.5 flex items-center gap-2 border-b border-primary-100 dark:border-primary-900">
        <Sparkles size={13} className="text-primary-500" />
        <p className="text-xs font-bold text-primary-700 dark:text-primary-300">Hasil Ekstraksi AI — Periksa & Simpan</p>
        {data.confidence && (
          <span className="ml-auto text-[10px] bg-primary-200 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-bold">
            {Math.round(data.confidence * 100)}% akurasi
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Type + Amount */}
        <div className="flex gap-2 items-center">
          <div className="flex bg-zinc-100 dark:bg-zinc-700 rounded-xl p-0.5 flex-shrink-0">
            {[['expense', 'Keluar'], ['income', 'Masuk']].map(([v, l]) => (
              <button key={v} onClick={() => set('type', v)}
                className={`px-2.5 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                  form.type === v ? (v === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'text-zinc-500'
                }`}>{l}</button>
            ))}
          </div>
          <input type="number" value={form.amount || ''} onChange={e => set('amount', parseInt(e.target.value) || 0)}
            className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Nominal" inputMode="numeric" />
        </div>
        {form.amount > 0 && (
          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold -mt-1 px-0.5">{formatRupiah(form.amount)}</p>
        )}

        {/* Category */}
        <div>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">KATEGORI</p>
          <div className="grid grid-cols-4 gap-1.5">
            {filteredCats.map(c => (
              <button key={c.id} onClick={() => set('category', c.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 text-[10px] font-semibold transition-all ${
                  form.category === c.id
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'border-transparent bg-zinc-50 dark:bg-zinc-700 text-zinc-500'
                }`}>
                <c.icon size={16} />
                {c.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Merchant + Note */}
        <input value={form.merchant || ''} onChange={e => set('merchant', e.target.value)}
          placeholder="Merchant / toko"
          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder-zinc-400" />
        <input value={form.note || ''} onChange={e => set('note', e.target.value)}
          placeholder="Catatan transaksi"
          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder-zinc-400" />

        {/* Payment method — with logos */}
        <div>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">METODE PEMBAYARAN</p>
          <button onClick={() => setShowPayPicker(p => !p)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 transition">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <PayLogo method={selectedPay} size={22} />
            </div>
            <span className="text-xs font-bold text-primary-700 dark:text-primary-300 flex-1 text-left">{selectedPay.label}</span>
            <span className="text-[10px] text-primary-400">{showPayPicker ? '▲ Tutup' : '▼ Ubah'}</span>
          </button>

          <AnimatePresence>
            {showPayPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-3">
                  {PAYMENT_GROUPS.map(grp => (
                    <div key={grp.group}>
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">{grp.group.toUpperCase()}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {grp.items.map(item => (
                          <button key={item.id}
                            onClick={() => { set('payMethod', item.id); setShowPayPicker(false) }}
                            className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all ${
                              form.payMethod === item.id
                                ? 'border-primary-400 bg-primary-50 dark:bg-primary-950'
                                : 'border-transparent bg-zinc-50 dark:bg-zinc-700'
                            }`}>
                            <div className="w-6 h-6 flex items-center justify-center">
                              <PayLogo method={item} size={22} />
                            </div>
                            <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 text-center leading-tight">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date */}
        <input type="date" value={form.date || new Date().toISOString().split('T')[0]}
          onChange={e => set('date', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-400" />

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => onSave(form)}
            disabled={!form.amount || form.amount < 100}
            className="flex-1 bg-primary-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-sm">
            <Check size={15} /> Simpan Transaksi
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onCancel}
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 text-sm">
            <X size={15} /> Batal
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Greeting ────────────────────────────────────────────────
const AI_GREET = {
  id: 'ai-0', role: 'ai',
  content: 'Halo Dita! Ceritain transaksimu, contoh:\n\n💬 *"beli kopi 25rb pakai GoPay"*\n💬 *"gojek ke kampus 18000 via DANA"*\n💬 *"beasiswa masuk 2.5jt"*\n\nAtau upload foto struk!',
}

export default function TransaksiPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab]           = useState(searchParams.get('tab') || 'ai')
  const [messages, setMessages] = useState([AI_GREET])
  const [input, setInput]       = useState('')
  const [aiLoading, setAiLoading]       = useState(false)
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading]       = useState(true)
  const [scanLoading, setScanLoading]   = useState(false)
  const chatEndRef = useRef(null)
  const fileRef    = useRef(null)
  const idCounter  = useRef(1)

  useEffect(() => {
    getTransactionsAPI().then(txs => { setTransactions(txs); setTxLoading(false) })
  }, [])

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages])

  // Generate unique ID
  const generateId = () => {
    idCounter.current += 1
    return `${Date.now()}-${idCounter.current}`
  }

  // ── SEND ──────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim()
    if (!text || aiLoading) return
    setInput('')
    const userId = generateId()
    const extractId = generateId()
    setMessages(m => [
      ...m,
      { id: userId, role: 'user', content: text },
      { id: extractId, role: 'ai', type: 'extracting', content: 'AI kami sedang mengekstrak kategori, merchant, nominal, dan metode pembayaran untukmu...' },
    ])
    setAiLoading(true)
    try {
      const extracted = await extractFromAI(text)
      if (!extracted.amount || extracted.amount < 100) {
        setMessages(m => m.map(x => x.id === extractId ? {
          id: extractId, role: 'ai',
          content: 'Hmm, tidak bisa mengenali nominalnya 😅\nCoba: *"beli kopi 25.000 pakai GoPay"*',
        } : x))
      } else {
        setMessages(m => m.map(x => x.id === extractId ? {
          id: extractId, role: 'ai', type: 'form',
          extracted: { ...extracted, date: new Date().toISOString().split('T')[0] },
        } : x))
      }
    } catch {
      setMessages(m => m.map(x => x.id === extractId ? { id: extractId, role: 'ai', content: 'Gagal mengekstrak 😔 Coba lagi.' } : x))
    } finally {
      setAiLoading(false)
    }
  }

  const handleSaveFromForm = async (formData, msgId) => {
    try {
      const newTx = await addTransactionAPI(formData)
      setTransactions(prev => [newTx, ...prev])
      setMessages(m => m.map(x => x.id === msgId ? {
        id: msgId, role: 'ai', type: 'success',
        content: `✅ **Tersimpan!** ${formatRupiah(formData.amount)} berhasil dicatat.\n\nMau catat yang lain? 😊`,
      } : x))
    } catch { alert('Gagal menyimpan') }
  }

  const cancelForm = (msgId) => setMessages(m => m.filter(x => x.id !== msgId))

  // ── UPLOAD ─────────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return
    setScanLoading(true)
    const scanId = generateId()
    setMessages(m => [...m, { id: scanId, role: 'ai', type: 'extracting', content: '📸 Membaca foto struk dan mengekstrak data...' }])
    try {
      const result = await uploadInvoiceAPI(file)
      setMessages(m => m.map(x => x.id === scanId ? {
        id: scanId, role: 'ai', type: 'form',
        extracted: { type: 'expense', amount: result.total, category: result.category || 'makanan', note: result.merchant, merchant: result.merchant, date: result.date, payMethod: 'cash', confidence: result.confidence },
      } : x))
    } catch {
      setMessages(m => m.map(x => x.id === scanId ? { id: scanId, role: 'ai', content: 'Gagal membaca foto 😔' } : x))
    } finally { setScanLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return
    await deleteTransactionAPI(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const pay = (id) => getPayment(id)

  return (
    <Layout>
      <AnimatedPage>
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-14 px-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-white">Transaksi</h1>
              <p className="text-primary-200 text-xs">Catat & pantau keuanganmu</p>
            </div>
            <div className="flex bg-white/15 rounded-xl p-0.5">
              {[['ai', 'AI DompetKuy'], ['list', 'Riwayat']].map(([v, l]) => (
                <motion.button key={v} whileTap={{ scale: 0.95 }}
                  onClick={() => setTab(v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${tab === v ? 'bg-white text-primary-700' : 'text-white'}`}>
                  {v === 'ai' ? <Bot size={14} /> : <List size={14} />} {l}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── AI CHAT ── */}
          {tab === 'ai' && (
            <motion.div key="ai"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
              style={{ height: 'calc(100dvh - 170px)' }}
            >
              {/* AI bar */}
              <div className="px-5 py-3 bg-primary-50 dark:bg-primary-950 border-b border-primary-100 dark:border-primary-900 flex items-center gap-3">
                <div className="w-11 h-11 flex-shrink-0 relative">
                  <img src="/robot-ai.png" alt="AI" className="w-11 h-11 object-contain"
                    onError={e => { e.target.style.display = 'none'; if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex' }} />
                  <div className="w-11 h-11 bg-primary-200 dark:bg-primary-800 rounded-2xl items-center justify-center hidden absolute inset-0"><Bot size={20} className="text-primary-600" /></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary-800 dark:text-primary-200">AI DompetKuy</p>
                  <p className="text-xs text-primary-500 dark:text-primary-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                    Siap mengekstrak transaksimu
                  </p>
                </div>
                <input type="file" ref={fileRef} accept="image/*" className="hidden"
                  onChange={e => handleUpload(e.target.files[0])} />
                <motion.button whileTap={{ scale: 0.93 }}
                  onClick={() => fileRef.current?.click()}
                  disabled={scanLoading}
                  className="flex items-center gap-1.5 bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0">
                  {scanLoading ? <Loader size={13} className="animate-spin" /> : <Camera size={13} />}
                  Upload Struk
                </motion.button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide bg-zinc-50 dark:bg-zinc-900">
                {messages.map(msg => (
                  <div key={msg.id}>
                    {msg.role === 'ai' ? (
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                          <img src="/robot-ai.png" alt="AI" className="w-5 h-5 object-contain" />
                        </div>
                        <div className="max-w-[88%] flex-1">
                          {msg.type === 'extracting' ? (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              className="bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 rounded-2xl rounded-bl-sm px-4 py-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-primary-500 animate-pulse" />
                                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">{msg.content}</p>
                              </div>
                              <div className="flex gap-1">
                                {[0, 200, 400].map(d => (
                                  <div key={d} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                ))}
                              </div>
                            </motion.div>
                          ) : msg.type === 'form' ? (
                            <ExtractedForm
                              data={msg.extracted}
                              onSave={fd => handleSaveFromForm(fd, msg.id)}
                              onCancel={() => cancelForm(msg.id)}
                            />
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed ${
                                msg.type === 'success'
                                  ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-soft'
                              }`}>
                              {msg.content.split('\n').map((line, i) => (
                                <p key={i} className="text-zinc-700 dark:text-zinc-300 min-h-[4px]"
                                  dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="max-w-[78%] bg-primary-600 text-white text-sm px-4 py-3 rounded-2xl rounded-br-sm">
                          {msg.content}
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder='cth: "kopi 25rb pakai GoPay di Kenangan"'
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white dark:focus:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 transition" />
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={handleSend} disabled={!input.trim() || aiLoading}
                    className="w-11 h-11 bg-primary-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 rounded-2xl flex items-center justify-center transition flex-shrink-0">
                    {aiLoading
                      ? <Loader size={16} className="text-white animate-spin" />
                      : <Send size={16} className={input.trim() ? 'text-white' : 'text-zinc-400'} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RIWAYAT ── */}
          {tab === 'list' && (
            <motion.div key="list"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="px-5 mt-4"
            >
              {txLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign size={32} className="text-zinc-400" />
                  </div>
                  <p className="font-semibold text-zinc-500 dark:text-zinc-400">Belum ada transaksi</p>
                </div>
              ) : (
                <motion.div className="space-y-2 mb-4"
                  initial="hidden" animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                >
                  {transactions.map(tx => {
                    const cat     = getCategoryInfo(tx.category, CATEGORIES)
                    const payment = tx.payMethod ? getPayment(tx.payMethod) : null
                    return (
                      <motion.div key={tx.id}
                        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        className="bg-white dark:bg-zinc-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-zinc-50 dark:border-zinc-700 group"
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cat.color+'18' }}>
                          <cat.icon size={18} style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{tx.note}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-xs text-zinc-400">{tx.merchant || cat.label} · {formatTanggalPendek(tx.date)}</p>
                            {payment && (
                              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-700 rounded-full px-1.5 py-0.5">
                                <div className="w-3.5 h-3.5 flex items-center justify-center">
                                  <PayLogo method={payment} size={14} />
                                </div>
                                <span className="text-[10px] text-zinc-400 font-medium">{payment.label}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                          </span>
                          <motion.button whileTap={{ scale: 0.85 }}
                            onClick={() => handleDelete(tx.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedPage>
    </Layout>
  )
}
