import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginAPI } from '../services/authService'
import { useGoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, ArrowRight, Wallet, Bot, FileText, BarChart3, ShoppingCart } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        setError('')
        
        // Send access_token to backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Google login failed')
        }

        login(data.user, data.token)
        navigate('/')
      } catch (err) {
        setError(err.message || 'Google login gagal')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError('Google login dibatalkan atau gagal')
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await loginAPI(email, password)
      login(user, token)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    googleLogin()
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950 theme-transition flex flex-col lg:flex-row">

      {/* ── LEFT PANEL (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex-col relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-40 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Wallet size={22} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">DompetKuy</span>
          </div>
        </div>

        {/* Hero image + text */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-10">
          {/* 
            =====================================================
            HERO IMAGE dari file: public/images/landing-hero.png
            Ukuran display: max 420px lebar, object-contain
            =====================================================
          */}
          <img
            src="/images/landing-hero.png"
            alt="DompetKuy illustration"
            className="w-full max-w-sm object-contain drop-shadow-2xl mb-6"
            style={{ maxHeight: '380px' }}
          />
          <h2 className="font-display text-3xl font-bold text-white text-center leading-tight mb-3">
            Kelola keuangan<br />lebih cerdas dengan AI
          </h2>
          <p className="text-primary-200 text-center text-sm leading-relaxed max-w-xs">
            Catat transaksi, analisis pengeluaran, dan dapatkan rekomendasi personal dari AI dalam satu aplikasi.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {[
              { icon: Bot, label: 'AI Catat Transaksi' },
              { icon: FileText, label: 'Scan Invoice' },
              { icon: BarChart3, label: 'Laporan Otomatis' },
              { icon: ShoppingCart, label: 'Prediksi Sembako' }
            ].map(f => (
              <span key={f.label} className="bg-white/15 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <f.icon size={12} /> {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 max-w-lg mx-auto w-full lg:max-w-none">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950 px-4 py-2 rounded-2xl">
            <Wallet size={20} className="text-primary-600" />
            <span className="font-display font-bold text-primary-700 dark:text-primary-300">DompetKuy</span>
          </div>
          {/* Mobile hero image */}
          <img src="/images/landing-hero.png" alt="DompetKuy"
            className="w-48 mx-auto mt-4 object-contain"
            style={{ maxHeight: '180px' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>

        <div className="w-full max-w-sm mx-auto lg:max-w-md">
          <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white mb-1">Masuk ke Akun</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
            Selamat datang di <span className="text-primary-600 font-semibold">DompetKuy</span>
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-2xl px-4 py-3 mb-5">{error}</div>
          )}

          {/* Google Sign In */}
          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 font-semibold py-3.5 rounded-2xl transition mb-4 text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-400">atau</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="kamu@email.com" required
                className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-zinc-700 transition text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-zinc-700 transition text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/lupa-password" className="text-xs text-primary-600 hover:underline">Lupa password?</Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-primary-100 dark:shadow-primary-900">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Masuk <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
