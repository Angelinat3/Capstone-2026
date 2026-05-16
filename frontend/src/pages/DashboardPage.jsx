import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight, Settings, Moon, Sun, Eye, EyeOff, BarChart3, Camera, ShoppingCart, Package } from 'lucide-react'
import Layout from '../components/Layout'
import { getTransactionsAPI } from '../services/transactionService'
import { MONTHLY_CHART_DATA, CATEGORY_CHART_DATA, CATEGORIES } from '../utils/dummyData'
import { formatRupiah, formatTanggalPendek, getCategoryInfo } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import { staggerContainer, staggerItem, cardHover } from '../utils/animations'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 p-3 text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'pemasukan' ? '↑ ' : '↓ '}{formatRupiah(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [loading, setLoading] = useState(true)
  const [hideBalance, setHideBalance] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTransactionsAPI()
      .then(txs => {
        if (cancelled) return
        const list = Array.isArray(txs) ? txs : []
        setTransactions(list)
        const income = list.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
        const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
        const initialBalance = user?.accounts?.reduce((s, a) => s + parseFloat(a.balance || 0), 0) || 0
        setSummary({ totalIncome: income, totalExpense: expense, balance: initialBalance + income - expense })
      })
      .catch(() => {
        if (cancelled) return
        setTransactions([])
        const initialBalance = user?.accounts?.reduce((s, a) => s + parseFloat(a.balance || 0), 0) || 0
        setSummary({ totalIncome: 0, totalExpense: 0, balance: initialBalance })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const recentTx = transactions.slice(0, 5)

  return (
    <Layout>
      <AnimatedPage>
      {/* ── HERO HEADER ── Full width gradient */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 pt-14 px-5 pb-20 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-20 -left-12 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative">
          <div>
            <p className="text-primary-200 text-sm">Selamat datang</p>
            <h1 className="font-display text-xl font-bold text-white">
              {user?.name || 'Dita'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggle}
              className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition">
              {dark ? <Sun size={17} className="text-yellow-300" /> : <Moon size={17} className="text-white" />}
            </button>
            <button onClick={() => navigate('/settings')}
              className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition">
              <Settings size={17} className="text-white" />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="relative">
          <p className="text-primary-200 text-xs font-semibold mb-1 tracking-wide">TOTAL SALDO</p>
          <div className="flex items-center gap-2 mb-0.5">
            {loading
              ? <div className="h-9 w-44 bg-white/20 animate-pulse rounded-lg" />
              : <h2 className="font-display text-3xl font-bold text-white">
                  {hideBalance ? '••••••••' : formatRupiah(summary.balance)}
                </h2>
            }
            <button onClick={() => setHideBalance(h => !h)} className="text-primary-200 hover:text-white transition mt-1">
              {hideBalance ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <p className="text-primary-200 text-xs">April 2026</p>
        </div>
      </div>

      {/* ── QUICK STATS — overlap header ── */}
      <div className="px-5 -mt-10 relative z-10">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-card dark:shadow-none border border-zinc-50 dark:border-zinc-700 p-4 grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Pemasukan</p>
            </div>
            <p className="font-display font-bold text-base text-emerald-700 dark:text-emerald-300">
              {loading ? '...' : formatRupiah(summary.totalIncome)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/60 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-red-500 dark:text-red-400" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">Pengeluaran</p>
            </div>
            <p className="font-display font-bold text-base text-red-600 dark:text-red-300">
              {loading ? '...' : formatRupiah(summary.totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* ── QUICK MENU ── */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: null,  isRobot: true,  label: 'AI Dompetkuy', to: '/transaksi' },
            { icon: BarChart3, isRobot: false, label: 'Laporan',     to: '/laporan'   },
            { icon: Camera,   isRobot: false, label: 'Upload Foto', to: '/transaksi' },
            { icon: ShoppingCart, isRobot: false, label: 'Sembako',     to: '/prediksi'  },
          ].map(m => (
            <motion.div key={m.label} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
              <Link to={m.to}
                className="flex flex-col items-center gap-1.5 bg-white dark:bg-zinc-800 rounded-2xl py-3 border border-zinc-50 dark:border-zinc-700 shadow-soft transition">
                {m.isRobot
                  ? <img src="/robot-ai.png" alt="AI" className="w-8 h-8 object-contain" />
                  : <m.icon size={24} className="text-zinc-600 dark:text-zinc-300" />
                }
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 text-center leading-tight">{m.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CHART ── */}
      <div className="px-5 mt-5">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-50 dark:border-zinc-700 p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-white text-sm">Tren Keuangan</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">6 bulan terakhir</p>
            </div>
            <div className="flex gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-400 inline-block" />Masuk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Keluar</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MONTHLY_CHART_DATA}>
              <defs>
                <linearGradient id="inc2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${v/1e6}jt`} tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="pemasukan"   stroke="#8b5cf6" strokeWidth={2} fill="url(#inc2)" />
              <Area type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} fill="url(#exp2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── LAPORAN CARD ── */}
      <div className="px-5 mt-5">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Laporan Keuangan</p>
            <p className="text-primary-200 text-xs">Harian · Mingguan · Bulanan · Tahunan</p>
          </div>
          <Link to="/laporan"
            className="bg-white text-primary-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-primary-50 transition flex items-center gap-1 flex-shrink-0">
            Lihat <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── PENGELUARAN TERBESAR ── */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-800 dark:text-white text-sm">Pengeluaran Terbesar</h3>
          <Link to="/laporan" className="text-primary-600 text-xs font-semibold">Laporan →</Link>
        </div>
        <div className="space-y-2">
          {CATEGORY_CHART_DATA.slice(0,4).map(c => {
            const total = CATEGORY_CHART_DATA.reduce((s,x) => s+x.value, 0)
            const pct = Math.round((c.value/total)*100)
            return (
              <div key={c.name} className="bg-white dark:bg-zinc-800 rounded-2xl p-3.5 flex items-center gap-3 border border-zinc-50 dark:border-zinc-700">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.color+'18' }}>
                  {(() => {
                    const cat = CATEGORIES.find(x => x.label.startsWith(c.name))
                    const Icon = cat?.icon || Package
                    return <Icon size={18} style={{ color: c.color }} />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{c.name}</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-white">{formatRupiah(c.value)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${pct}%`, background:c.color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TRANSAKSI TERAKHIR ── */}
      <div className="px-5 mt-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-800 dark:text-white text-sm">Transaksi Terakhir</h3>
          {/* "Semua" diarahkan ke halaman transaksi tab riwayat */}
          <Link to="/transaksi?tab=list" className="text-primary-600 dark:text-primary-400 text-xs font-semibold flex items-center gap-1">
            Semua <ArrowRight size={12} />
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-50 dark:border-zinc-700 overflow-hidden">
          {recentTx.map((tx, i) => {
            const cat = getCategoryInfo(tx.category, CATEGORIES)
            const CatIcon = cat.icon
            return (
              <Link key={tx.id} to="/transaksi?tab=list"
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition ${i < recentTx.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-700' : ''}`}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.color+'18' }}>
                  <CatIcon size={18} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{tx.note}</p>
                  <p className="text-xs text-zinc-400">{tx.merchant} · {formatTanggalPendek(tx.date)}</p>
                </div>
                <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      </AnimatedPage>
    </Layout>
  )
}
