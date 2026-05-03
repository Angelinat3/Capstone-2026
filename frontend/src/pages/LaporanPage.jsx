import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import AnimatedPage from '../components/AnimatedPage'
import { getTransactionsAPI } from '../services/transactionService'
import { CATEGORIES } from '../utils/dummyData'
import { formatRupiah, getCategoryInfo } from '../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { staggerContainer, staggerItem } from '../utils/animations'

const PERIODS = ['Mingguan', 'Bulanan', 'Tahunan']

const MONTH_ID    = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

// ── ISO week helpers ─────────────────────────────────────────
function getISOWeekYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return {
    week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7),
    year: d.getUTCFullYear(),
  }
}

function getMondayOfISOWeek(week, year) {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4day + 1 + (week - 1) * 7)
  return monday
}

function maxISOWeek(year) {
  return getISOWeekYear(new Date(year, 11, 28)).week
}

function fmtD(d) {
  return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

// ── Tooltip ──────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
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

export default function LaporanPage() {
  const navigate = useNavigate()
  const today = new Date()

  const [period, setPeriod] = useState('Bulanan')
  const [transactions, setTxs] = useState([])
  const [loading, setLoading]  = useState(true)

  // ── Selectors per period type ──────────────────────────────
  // Mingguan: { week, year }
  const { week: curWeek, year: curWYear } = getISOWeekYear(today)
  const [selWeek, setSelWeek]   = useState(curWeek)
  const [selWYear, setSelWYear] = useState(curWYear)

  // Bulanan: { month 0-11, year }
  const [selMonth, setSelMonth] = useState(today.getMonth())
  const [selMYear, setSelMYear] = useState(today.getFullYear())

  // Tahunan: year
  const [selYear, setSelYear]   = useState(today.getFullYear())

  useEffect(() => {
    getTransactionsAPI().then(txs => { setTxs(txs); setLoading(false) })
  }, [])

  // ── Navigate helpers ─────────────────────────────────────
  const prevWeek = () => {
    if (selWeek === 1) { setSelWeek(maxISOWeek(selWYear - 1)); setSelWYear(y => y - 1) }
    else setSelWeek(w => w - 1)
  }
  const nextWeek = () => {
    const max = maxISOWeek(selWYear)
    if (selWeek === max) { setSelWeek(1); setSelWYear(y => y + 1) }
    else setSelWeek(w => w + 1)
  }
  const isCurrentWeek = selWeek === curWeek && selWYear === curWYear

  const prevMonth = () => { if (selMonth === 0) { setSelMonth(11); setSelMYear(y => y - 1) } else setSelMonth(m => m - 1) }
  const nextMonth = () => { if (selMonth === 11) { setSelMonth(0); setSelMYear(y => y + 1) } else setSelMonth(m => m + 1) }
  const isCurrentMonth = selMonth === today.getMonth() && selMYear === today.getFullYear()

  const isCurrentYear = selYear === today.getFullYear()

  // ── Compute data ─────────────────────────────────────────
  let filtered = []
  let chartData = []
  let periodLabel = ''

  if (period === 'Mingguan') {
    const mon = getMondayOfISOWeek(selWeek, selWYear)
    const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6)
    filtered    = transactions.filter(t => { const d = new Date(t.date + 'T00:00:00Z'); return d >= mon && d <= sun })
    periodLabel = `${fmtD(mon)} – ${fmtD(sun)}`
    chartData   = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((name, i) => {
      const day = new Date(mon); day.setUTCDate(mon.getUTCDate() + i)
      const ds  = day.toISOString().split('T')[0]
      const dayTxs = transactions.filter(t => t.date === ds)
      return {
        name,
        pemasukan:   dayTxs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0),
        pengeluaran: dayTxs.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0),
      }
    })
  }

  if (period === 'Bulanan') {
    filtered    = transactions.filter(t => { const d = new Date(t.date); return d.getFullYear() === selMYear && d.getMonth() === selMonth })
    periodLabel = `${MONTH_ID[selMonth]} ${selMYear}`
    const daysInMonth = new Date(selMYear, selMonth + 1, 0).getDate()
    chartData = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => {
      const start = i * 7 + 1, end = Math.min((i + 1) * 7, daysInMonth)
      const wTxs = filtered.filter(t => { const day = new Date(t.date).getDate(); return day >= start && day <= end })
      return {
        name: `${start}–${end}`,
        pemasukan:   wTxs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0),
        pengeluaran: wTxs.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0),
      }
    })
  }

  if (period === 'Tahunan') {
    filtered    = transactions.filter(t => new Date(t.date).getFullYear() === selYear)
    periodLabel = `Tahun ${selYear}`
    chartData   = MONTH_SHORT.map((name, idx) => {
      const mTxs = filtered.filter(t => new Date(t.date).getMonth() === idx)
      return {
        name,
        pemasukan:   mTxs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0),
        pengeluaran: mTxs.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0),
      }
    })
  }

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0)
  const catBreakdown = CATEGORIES.filter(c => c.id !== 'pemasukan')
    .map(c => ({ ...c, total: filtered.filter(t => t.type === 'expense' && t.category === c.id).reduce((s,t) => s+t.amount, 0) }))
    .filter(x => x.total > 0).sort((a,b) => b.total - a.total)

  // ── Navigator per period ─────────────────────────────────
  const Navigator = () => {
    if (period === 'Mingguan') return (
      <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl px-4 py-3 border border-zinc-100 dark:border-zinc-700">
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition">
          <ChevronLeft size={18} />
        </motion.button>
        <div className="text-center flex-1 px-2">
          <motion.p key={periodLabel} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
            className="text-sm font-bold text-zinc-800 dark:text-white leading-tight">{periodLabel}</motion.p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Minggu {selWeek} · {selWYear}</p>
        </div>
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={nextWeek}
          disabled={isCurrentWeek}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 disabled:opacity-30 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition">
          <ChevronRight size={18} />
        </motion.button>
      </div>
    )

    if (period === 'Bulanan') return (
      <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl px-4 py-3 border border-zinc-100 dark:border-zinc-700">
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition">
          <ChevronLeft size={18} />
        </motion.button>
        <div className="flex items-center gap-2">
          {/* Month picker */}
          <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
            className="bg-transparent font-bold text-sm text-zinc-800 dark:text-white focus:outline-none cursor-pointer">
            {MONTH_ID.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          {/* Year picker — unlimited */}
          <select value={selMYear} onChange={e => setSelMYear(Number(e.target.value))}
            className="bg-transparent font-bold text-sm text-zinc-800 dark:text-white focus:outline-none cursor-pointer">
            {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={nextMonth}
          disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 disabled:opacity-30 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition">
          <ChevronRight size={18} />
        </motion.button>
      </div>
    )

    if (period === 'Tahunan') return (
      <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl px-4 py-3 border border-zinc-100 dark:border-zinc-700">
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={() => setSelYear(y => y - 1)}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition">
          <ChevronLeft size={18} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary-500" />
          <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
            className="bg-transparent font-bold text-lg text-zinc-800 dark:text-white focus:outline-none cursor-pointer">
            {Array.from({ length: 15 }, (_, i) => today.getFullYear() - 10 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={() => setSelYear(y => y + 1)}
          disabled={isCurrentYear}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 disabled:opacity-30 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition">
          <ChevronRight size={18} />
        </motion.button>
      </div>
    )
    return null
  }

  return (
    <Layout>
      <AnimatedPage>
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-14 px-5 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <motion.button whileTap={{ scale:0.9 }} onClick={() => navigate(-1)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={18} className="text-white" />
            </motion.button>
            <div>
              <h1 className="font-display text-xl font-bold text-white">Laporan Keuangan</h1>
              <p className="text-primary-200 text-xs">Analisis detail transaksimu</p>
            </div>
          </div>
          {/* Period tabs */}
          <div className="flex bg-white/15 rounded-2xl p-1 gap-0.5">
            {PERIODS.map(p => (
              <motion.button key={p} whileTap={{ scale:0.95 }}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  period === p ? 'bg-white text-primary-700 shadow' : 'text-white'
                }`}>{p}</motion.button>
            ))}
          </div>
        </div>

        <div className="px-5 mt-4 space-y-4 pb-6">
          {/* Navigator */}
          <Navigator />

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">

              {/* Summary cards */}
              <motion.div variants={staggerItem} className="grid grid-cols-3 gap-3">
                {[
                  { label:'PEMASUKAN',  val:totalIncome,                  cls:'bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900', txt:'text-emerald-700 dark:text-emerald-400' },
                  { label:'PENGELUARAN',val:totalExpense,                 cls:'bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900',                 txt:'text-red-600 dark:text-red-400' },
                  { label:'SELISIH',    val:Math.abs(totalIncome-totalExpense),
                    cls: totalIncome>=totalExpense ? 'bg-primary-50 dark:bg-primary-950 border-primary-100 dark:border-primary-900' : 'bg-orange-50 dark:bg-orange-950 border-orange-100',
                    txt: totalIncome>=totalExpense ? 'text-primary-700 dark:text-primary-300' : 'text-orange-600' },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-3 border ${s.cls}`}>
                    <p className="text-[10px] font-bold text-zinc-400 mb-1">{s.label}</p>
                    <p className={`font-display font-bold text-sm leading-tight ${s.txt}`}>{formatRupiah(s.val)}</p>
                  </div>
                ))}
              </motion.div>

              {/* Chart */}
              {chartData.some(d => (d.pemasukan||0)+(d.pengeluaran||0) > 0) && (
                <motion.div variants={staggerItem} className="bg-white dark:bg-zinc-800 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-zinc-800 dark:text-white">Grafik {period}</p>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-xs text-zinc-400"><span className="w-2.5 h-1.5 rounded bg-primary-400 inline-block" />Masuk</span>
                      <span className="flex items-center gap-1 text-xs text-zinc-400"><span className="w-2.5 h-1.5 rounded bg-orange-400 inline-block" />Keluar</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={chartData} barSize={period==='Mingguan'?18:12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis dataKey="name" tick={{ fontSize:9, fill:'#a1a1aa' }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tickFormatter={v => v>=1e6?`${(v/1e6).toFixed(1)}jt`:`${(v/1e3).toFixed(0)}k`}
                        tick={{ fontSize:9, fill:'#a1a1aa' }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="pemasukan"   fill="#8b5cf6" radius={[4,4,0,0]} />
                      <Bar dataKey="pengeluaran" fill="#f97316" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Category breakdown */}
              {catBreakdown.length > 0 && (
                <motion.div variants={staggerItem} className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
                  <p className="text-sm font-bold text-zinc-800 dark:text-white px-4 pt-4 pb-3">Rincian Pengeluaran</p>
                  {catBreakdown.map((c, i) => {
                    const pct = totalExpense > 0 ? Math.round((c.total/totalExpense)*100) : 0
                    return (
                      <motion.div key={c.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                        className={`flex items-center gap-3 px-4 py-3 ${i<catBreakdown.length-1?'border-b border-zinc-50 dark:border-zinc-700':''}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ background:c.color+'20' }}>{c.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{c.label}</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-white">{formatRupiah(c.total)}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
                              transition={{ duration:0.6, delay:i*0.05 }}
                              className="h-full rounded-full" style={{ background:c.color }} />
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* Transaction list */}
              {filtered.length === 0 ? (
                <motion.div variants={staggerItem} className="text-center py-12 text-zinc-400">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tidak ada transaksi pada periode ini</p>
                </motion.div>
              ) : (
                <motion.div variants={staggerItem} className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
                  <p className="text-sm font-bold text-zinc-800 dark:text-white px-4 pt-4 pb-2">{filtered.length} Transaksi</p>
                  {filtered.slice(0,30).map((tx, i) => {
                    const cat = getCategoryInfo(tx.category, CATEGORIES)
                    return (
                      <div key={tx.id} className={`flex items-center gap-3 px-4 py-3 ${i<Math.min(filtered.length,30)-1?'border-b border-zinc-50 dark:border-zinc-700':''}`}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                          style={{ background:cat.color+'18' }}>{cat.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{tx.note}</p>
                          <p className="text-[10px] text-zinc-400">{tx.date}</p>
                        </div>
                        <span className={`text-xs font-bold ${tx.type==='income'?'text-emerald-600':'text-zinc-700 dark:text-zinc-300'}`}>
                          {tx.type==='income'?'+':'-'}{formatRupiah(tx.amount)}
                        </span>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </AnimatedPage>
    </Layout>
  )
}
