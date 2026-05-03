import { motion } from 'framer-motion'
import AnimatedPage from './../components/AnimatedPage'
import { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import { getRekomendasiAPI } from '../services/aiService'
import { formatRupiah } from '../utils/helpers'

const TYPE_CFG = {
  warning: { bg: 'bg-amber-50',   border: 'border-amber-100',  badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400' },
  alert:   { bg: 'bg-red-50',     border: 'border-red-100',    badge: 'bg-red-100 text-red-700',         dot: 'bg-red-400' },
  tip:     { bg: 'bg-blue-50',    border: 'border-blue-100',   badge: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-400' },
  good:    { bg: 'bg-emerald-50', border: 'border-emerald-100',badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
}
const TYPE_LABEL = { warning: 'Perhatian', alert: 'Peringatan', tip: 'Tips', good: 'Bagus!' }

export default function RekomendasiPage() {
  const [recs, setRecs]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await getRekomendasiAPI()
    setRecs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const totalSaving = recs.filter(r => r.savingEstimate).reduce((s, r) => s + r.savingEstimate, 0)

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-14 px-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-white">AI Insight</h1>
            <p className="text-primary-200 text-xs mt-0.5">Analisis personal keuanganmu</p>
          </div>
          <button onClick={load} disabled={loading}
            className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
            <RefreshCw size={16} className={`text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Saving banner */}
        {!loading && totalSaving > 0 && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-primary-100 text-xs mb-1">Potensi hemat bulan ini</p>
                <p className="font-display text-2xl font-bold">{formatRupiah(totalSaving)}</p>
                <p className="text-primary-200 text-xs mt-1">Jika kamu ikuti semua rekomendasi</p>
              </div>
            </div>
          </div>
        )}

      {/* Robot banner */}
      <div className="bg-primary-50 border border-primary-100 rounded-3xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 flex-shrink-0">
          <img 
            src="/robot-ai.png" 
            alt="AI Robot" 
            className="w-12 h-12 object-contain rounded-2xl"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-primary-800">Analisis AI aktif</p>
          <p className="text-xs text-primary-500">Berdasarkan {20} transaksi terakhirmu</p>
        </div>
      </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-zinc-800 rounded-3xl h-32 animate-pulse border border-zinc-100" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {recs.map(rec => {
              const cfg = TYPE_CFG[rec.type] || TYPE_CFG.tip
              return (
                <div key={rec.id} className={`${cfg.bg} ${cfg.border} border rounded-3xl p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{rec.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-zinc-800 flex-1">{rec.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                          {TYPE_LABEL[rec.type]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{rec.message}</p>
                      {rec.savingEstimate && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/80 rounded-xl px-3 py-1.5">
                          <span className="text-xs text-zinc-500">Hemat est.:</span>
                          <span className="text-xs font-bold text-primary-700">{formatRupiah(rec.savingEstimate)}/bln</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center py-2">
          <p className="text-xs text-zinc-400">🔄 Insight diperbarui setiap kali kamu menambah transaksi</p>
        </div>
      </div>
    </Layout>
  )
}
