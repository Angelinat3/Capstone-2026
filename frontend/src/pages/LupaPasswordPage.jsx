import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Mail, ArrowRight, CheckCircle } from 'lucide-react'

export default function LupaPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Backend call → POST /auth/forgot-password { email }
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950 theme-transition flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate('/login')} className="flex items-center gap-1 text-zinc-500 text-sm mb-8 -ml-1">
          <ChevronLeft size={18} /> Kembali ke Login
        </button>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-white mb-2">Email Terkirim!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
              Cek inbox <strong>{email}</strong> dan ikuti instruksi untuk reset password.
            </p>
            <Link to="/login" className="text-primary-600 font-semibold text-sm hover:underline">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={22} className="text-primary-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white mb-1">Lupa Password?</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-7">
              Masukkan emailmu dan kami kirimkan link reset password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="kamu@email.com" required
                  className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-primary-100">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>Kirim Link Reset <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
