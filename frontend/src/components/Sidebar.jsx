import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, Upload,
  Sparkles, ShoppingBasket, LogOut, Wallet
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/transaksi',  icon: ArrowLeftRight,    label: 'Transaksi' },
  { to: '/invoice',    icon: Upload,            label: 'Scan Invoice' },
  { to: '/rekomendasi',icon: Sparkles,          label: 'Rekomendasi AI' },
  { to: '/prediksi',   icon: ShoppingBasket,    label: 'Prediksi Sembako' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login', { replace: true })
    setTimeout(() => {
      logout()
    }, 50)
  }

  return (
    <aside className="w-64 min-h-screen bg-surface-900 text-white flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">DompetKuy</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-surface-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-surface-400 hover:bg-surface-800 hover:text-red-400 transition-all"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
