import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { addTransactionAPI } from '../services/transactionService'
import { CATEGORIES } from '../utils/dummyData'
import { formatRupiah } from '../utils/helpers'
import { PAYMENT_GROUPS, ALL_PAYMENTS, PayLogo, getPayment } from '../utils/paymentMethods'

// ── Komponen logo pembayaran inline ─────────────────────────
function PayMethodButton({ method, selected, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all ${
        selected
          ? 'border-primary-400 bg-primary-50 dark:bg-primary-950'
          : 'border-transparent bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
      }`}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        <PayLogo method={method} size={28} />
      </div>
      <span className={`text-[10px] font-semibold leading-tight text-center ${
        selected ? 'text-primary-700 dark:text-primary-300' : 'text-zinc-500 dark:text-zinc-400'
      }`}>{method.label}</span>
    </motion.button>
  )
}

export default function TambahPage() {
  const navigate = useNavigate()
  const [type, setType]           = useState('expense')
  const [amount, setAmount]       = useState('')
  const [category, setCategory]   = useState('makanan')
  const [note, setNote]           = useState('')
  const [merchant, setMerchant]   = useState('')
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0])
  const [payMethod, setPayMethod] = useState('cash')
  const [showPayModal, setShowPayModal] = useState(false)
  const [loading, setLoading]     = useState(false)

  const displayAmount = amount ? parseInt(String(amount).replace(/\D/g, ''), 10) : 0
  const selectedPay   = getPayment(payMethod)

  const handleSave = async () => {
    if (!amount || displayAmount < 100) return
    setLoading(true)
    try {
      await addTransactionAPI({ type, amount: displayAmount, category, note, merchant, date, payMethod })
      navigate(-1)
    } catch { alert('Gagal menyimpan') }
    finally { setLoading(false) }
  }

  const filteredCats = CATEGORIES.filter(c =>
    type === 'income' ? c.id === 'pemasukan' : c.id !== 'pemasukan'
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="min-h-dvh bg-white dark:bg-zinc-950 max-w-2xl mx-auto flex flex-col theme-transition"
    >
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-14 px-5 pb-8">
        <div className="flex items-center justify-between mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} className="text-white" />
          </motion.button>
          <h1 className="font-display font-bold text-white text-base">Catat Transaksi Manual</h1>
          <div className="w-9" />
        </div>

        {/* Type toggle */}
        <div className="flex bg-white/15 rounded-2xl p-1">
          {[['expense', '🔴 Pengeluaran'], ['income', '🟢 Pemasukan']].map(([v, l]) => (
            <motion.button key={v} whileTap={{ scale: 0.97 }}
              onClick={() => { setType(v); setCategory(v === 'income' ? 'pemasukan' : 'makanan') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === v ? 'bg-white text-primary-700 shadow' : 'text-white'
              }`}>{l}</motion.button>
          ))}
        </div>

        {/* Amount */}
        <div className="text-center mt-6">
          <p className="text-primary-200 text-xs mb-1">Nominal</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-white/60 text-2xl font-bold">Rp</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="bg-transparent text-white text-4xl font-display font-bold text-center w-52 focus:outline-none placeholder-white/30"
              inputMode="numeric"
            />
          </div>
          <AnimatePresence>
            {displayAmount > 0 && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-primary-200 text-xs mt-1">{formatRupiah(displayAmount)}</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="flex-1 px-5 pt-5 pb-36 space-y-5 overflow-y-auto">

        {/* METODE PEMBAYARAN */}
        <div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide">METODE PEMBAYARAN</p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPayModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 transition"
          >
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <PayLogo method={selectedPay} size={26} />
            </div>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300 flex-1 text-left">{selectedPay.label}</span>
            <span className="text-xs text-primary-400 dark:text-primary-500">Ubah →</span>
          </motion.button>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 px-1">
            * Kategori pembayaran akan dianalisis otomatis oleh AI tim kami
          </p>
        </div>

        {/* KATEGORI */}
        <div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide">KATEGORI TRANSAKSI</p>
          <div className="grid grid-cols-4 gap-2">
            {filteredCats.map(c => (
              <motion.button key={c.id} whileTap={{ scale: 0.93 }}
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                  category === c.id
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-950'
                    : 'border-transparent bg-zinc-50 dark:bg-zinc-800'
                }`}>
                <span className="text-xl">{c.icon}</span>
                <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 leading-tight text-center">{c.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* CATATAN */}
        <div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide">CATATAN</p>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Beli apa / untuk apa?"
            className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white dark:focus:bg-zinc-700 text-sm transition" />
        </div>

        {/* MERCHANT */}
        <div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide">MERCHANT / TOKO</p>
          <input value={merchant} onChange={e => setMerchant(e.target.value)}
            placeholder="Nama toko / sumber pemasukan"
            className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white dark:focus:bg-zinc-700 text-sm transition" />
        </div>

        {/* TANGGAL */}
        <div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide">TANGGAL</p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white dark:focus:bg-zinc-700 text-sm transition" />
        </div>
      </div>

      {/* ── SAVE BUTTON ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-5 pb-8 pt-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-100 dark:border-zinc-800">
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={handleSave} disabled={loading || displayAmount < 100}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 disabled:from-zinc-200 disabled:to-zinc-200 disabled:text-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-primary-100 dark:shadow-none">
          {loading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Check size={18} /> Simpan Transaksi</>}
        </motion.button>
      </div>

      {/* ── PAYMENT MODAL ── */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowPayModal(false)}
          >
            <motion.div
              initial={{ y: 220, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 220, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-t-3xl w-full max-w-2xl max-h-[78dvh] flex flex-col"
            >
              <div className="relative flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
                <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">Pilih Metode Pembayaran</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPayModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"><X size={20} /></motion.button>
              </div>
              <div className="overflow-y-auto p-5 space-y-5 scrollbar-hide">
                {PAYMENT_GROUPS.map(grp => (
                  <div key={grp.group}>
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-3 tracking-wide">{grp.group.toUpperCase()}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {grp.items.map(item => (
                        <PayMethodButton
                          key={item.id}
                          method={item}
                          selected={payMethod === item.id}
                          onClick={() => { setPayMethod(item.id); setShowPayModal(false) }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
