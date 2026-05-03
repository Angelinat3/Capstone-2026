import { motion } from 'framer-motion'
import AnimatedPage from './../components/AnimatedPage'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Layout from '../components/Layout'
import { getPrediksiHargaAPI } from '../services/aiService'
import { formatRupiah } from '../utils/helpers'

const KOMODITAS = [
  { id: 'beras',         label: 'Beras',       emoji: '🌾' },
  { id: 'telur',         label: 'Telur',        emoji: '🥚' },
  { id: 'minyak_goreng', label: 'Minyak',       emoji: '🫙' },
]

const PriceTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const isPrediksi = payload[0]?.payload?.prediksi
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-100 p-3 text-xs">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      <p className={isPrediksi ? 'text-primary-600 font-bold' : 'text-zinc-800 font-bold'}>
        {isPrediksi ? '📊 ' : '📍 '}{formatRupiah(payload[0]?.value)}
      </p>
      {isPrediksi && <p className="text-zinc-400 mt-0.5">*Estimasi model AI</p>}
    </div>
  )
}

export default function PrediksiPage() {
  const [selected, setSelected] = useState('beras')
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getPrediksiHargaAPI(selected).then(d => { setData(d); setLoading(false) })
  }, [selected])

  const chartData = data ? [
    ...data.history.map(h => ({ tanggal: h.tanggal, harga: h.harga, prediksi: false })),
    ...data.prediksi.map(p => ({ tanggal: p.tanggal, harga: p.harga, prediksi: true })),
  ] : []

  const splitLabel = data ? data.history.at(-1)?.tanggal : null
  const latestActual = data?.history.at(-1)?.harga
  const latestPred   = data?.prediksi.at(-1)?.harga
  const pctChange    = latestActual && latestPred
    ? (((latestPred - latestActual) / latestActual) * 100).toFixed(1) : null

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-14 px-5 pb-6">
        <h1 className="font-display text-xl font-bold text-white">Prediksi Sembako</h1>
        <p className="text-primary-200 text-xs mt-0.5">Proyeksi AI 3 bulan ke depan</p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Komoditas tabs */}
        <div className="flex gap-2">
          {KOMODITAS.map(k => (
            <button key={k.id} onClick={() => setSelected(k.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                selected === k.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : 'bg-white text-zinc-600 border border-zinc-200'
              }`}>
              {k.emoji} {k.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-800 rounded-3xl h-64 animate-pulse border border-zinc-100" />
        ) : data && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-3.5 border border-zinc-100 shadow-soft">
                <p className="text-[10px] text-zinc-400 mb-1">Harga Kini</p>
                <p className="font-display font-bold text-sm text-zinc-900">{formatRupiah(latestActual)}</p>
                <p className="text-[10px] text-zinc-400">/{data.satuan}</p>
              </div>
              <div className="bg-primary-50 rounded-2xl p-3.5 border border-primary-100">
                <p className="text-[10px] text-primary-500 mb-1">Prediksi Jul</p>
                <p className="font-display font-bold text-sm text-primary-700">{formatRupiah(latestPred)}</p>
                <p className="text-[10px] text-primary-400">/{data.satuan}</p>
              </div>
              <div className={`rounded-2xl p-3.5 border ${data.trend === 'naik' ? 'bg-red-50 border-red-100' : data.trend === 'turun' ? 'bg-emerald-50 border-emerald-100' : 'bg-zinc-50 border-zinc-100'}`}>
                <p className="text-[10px] text-zinc-400 mb-1">Tren</p>
                <p className={`font-bold text-sm capitalize ${data.trend === 'naik' ? 'text-red-600' : data.trend === 'turun' ? 'text-emerald-600' : 'text-zinc-600'}`}>
                  {data.trend === 'naik' ? '↑' : data.trend === 'turun' ? '↓' : '→'} {data.trend}
                </p>
                {pctChange && <p className="text-[10px] text-zinc-400">{pctChange > 0 ? '+' : ''}{pctChange}%</p>}
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-4 border border-zinc-100 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-zinc-800">{data.label}</p>
                  <p className="text-xs text-zinc-400">Histori + 3 Bulan Prediksi</p>
                </div>
                <span className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-xl font-semibold">
                  {data.confidence}% confidence
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<PriceTooltip />} />
                  {splitLabel && (
                    <ReferenceLine x={splitLabel} stroke="#d4d4d8" strokeDasharray="4 4" />
                  )}
                  <Line type="monotone" dataKey="harga" stroke="#8b5cf6" strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      return (
                        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4}
                          fill={payload.prediksi ? '#ec4899' : '#8b5cf6'}
                          stroke="white" strokeWidth={2} />
                      )
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                {[['#8b5cf6','Aktual'],['#ec4899','Prediksi']].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="w-3 h-1.5 rounded-full" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-xs text-primary-700 leading-relaxed">
              ℹ️ Prediksi ini adalah estimasi dari model AI tim. Gunakan sebagai referensi perencanaan belanja, bukan keputusan finansial mutlak.
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
