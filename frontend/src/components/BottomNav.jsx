import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeftRight, Sparkles, ShoppingBasket, Plus, UserCircle } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            icon: Home,           label: 'Beranda'    },
  { to: '/transaksi',   icon: ArrowLeftRight,  label: 'Transaksi' },
  null, // FAB placeholder
  { to: '/rekomendasi', icon: Sparkles,        label: 'Insight'   },
  { to: '/profil',      icon: UserCircle,      label: 'Profil'    },
]

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <nav className="w-full max-w-2xl pointer-events-auto bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shadow-nav flex items-center justify-around px-1 pb-safe theme-transition">
        {NAV_ITEMS.map((item, i) => {
          if (!item) {
            return (
              <motion.button
                key="fab"
                onClick={() => navigate('/tambah')}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900">
                  <Plus size={26} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-zinc-400 mt-1">Catat</span>
              </motion.button>
            )
          }
          const { to, icon: Icon, label } = item
          return (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-3 px-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-400 dark:text-zinc-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-950' : ''}`}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                  </motion.div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
