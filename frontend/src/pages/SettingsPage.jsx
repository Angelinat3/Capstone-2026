import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plus,
  Save,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react'
import Layout from '../components/Layout'
import AnimatedPage from '../components/AnimatedPage'
import { useAuth } from '../context/AuthContext'
import { uploadAvatarAPI, deleteAvatarAPI } from '../services/authService'
import { formatRupiah } from '../utils/helpers'
import { ALL_PAYMENTS, PayLogo } from '../utils/paymentMethods'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const ACCOUNT_OPTIONS = ALL_PAYMENTS

const sectionCard =
  'bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-50 dark:border-zinc-700 shadow-card dark:shadow-none overflow-hidden'

function createAccountRow(account = {}) {
  const fallback = ACCOUNT_OPTIONS[0] || { id: 'cash', label: 'Cash' }
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: account.name || fallback.label,
    balance: String(account.balance ?? 0),
  }
}

function normalizeAccounts(accounts) {
  const list = Array.isArray(accounts) ? accounts : []
  if (list.length === 0) return [createAccountRow({ name: 'Cash', balance: 0 })]
  return list.map(acc => createAccountRow(acc))
}

function FieldLabel({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-white">{label}</p>
        {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAccounts, setSavingAccounts] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [accounts, setAccounts] = useState(normalizeAccounts(user?.accounts))
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
    })
    setAccounts(normalizeAccounts(user?.accounts))
  }, [user])

  const totalSaldo = useMemo(
    () => accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0),
    [accounts]
  )

  const selectedAvatar = user?.avatarUrl
    ? user.avatarUrl.startsWith('http')
      ? user.avatarUrl
      : `${API_BASE_URL}${user.avatarUrl}`
    : null

  const handleAvatarFile = async (file) => {
    if (!file) return
    try {
      setUploadingAvatar(true)
      const { user: updatedUser } = await uploadAvatarAPI(file)
      updateUser(updatedUser)
      setAvatarMenuOpen(false)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('Gagal mengunggah foto profil')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    try {
      setUploadingAvatar(true)
      const { user: updatedUser } = await deleteAvatarAPI()
      updateUser(updatedUser)
      setAvatarMenuOpen(false)
    } catch (error) {
      console.error('Failed to delete avatar:', error)
      alert('Gagal menghapus foto profil')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const saveProfile = async () => {
    const name = profile.name.trim()
    const email = profile.email.trim()
    if (!name) {
      alert('Nama tidak boleh kosong')
      return
    }
    if (!email || !email.includes('@')) {
      alert('Email tidak valid')
      return
    }

    try {
      setSavingProfile(true)
      await updateUser({ name, email })
      alert('Profil berhasil disimpan')
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Gagal menyimpan profil')
    } finally {
      setSavingProfile(false)
    }
  }

  const saveAccounts = async () => {
    try {
      setSavingAccounts(true)
      const payload = accounts.map(acc => ({
        name: acc.name,
        balance: parseFloat(acc.balance) || 0,
      }))
      await updateUser({ accounts: payload })
      alert('Rekening dan dompet berhasil disimpan')
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Gagal menyimpan rekening')
    } finally {
      setSavingAccounts(false)
    }
  }

  const savePassword = async () => {
    if (!password || password.length < 6) {
      alert('Password baru minimal 6 karakter')
      return
    }
    if (password !== passwordConfirm) {
      alert('Konfirmasi password tidak cocok')
      return
    }

    try {
      setSavingPassword(true)
      await updateUser({ password })
      setPassword('')
      setPasswordConfirm('')
      alert('Password berhasil diperbarui')
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Gagal memperbarui password')
    } finally {
      setSavingPassword(false)
    }
  }

  const updateAccountRow = (id, field, value) => {
    setAccounts(prev => prev.map(acc => (acc.id === id ? { ...acc, [field]: value } : acc)))
  }

  const addAccountRow = () => {
    const fallback = ACCOUNT_OPTIONS[0] || { label: 'Cash' }
    setAccounts(prev => [...prev, createAccountRow({ name: fallback.label, balance: 0 })])
  }

  const removeAccountRow = (id) => {
    setAccounts(prev => (prev.length > 1 ? prev.filter(acc => acc.id !== id) : prev))
  }

  return (
    <Layout>
      <AnimatedPage>
        <div className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 pt-14 px-5 pb-20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-24 -left-12 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition"
              >
                <ArrowLeft size={17} className="text-white" />
              </button>
              <div>
                <p className="text-primary-200 text-sm">Pengaturan akun</p>
                <h1 className="font-display text-xl font-bold text-white">Settings</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={saveProfile}
              className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
            >
              <Save size={15} />
              Simpan
            </button>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-display text-3xl font-bold">
                    {(user?.name || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen(v => !v)}
                className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
              >
                <Camera size={14} className="text-primary-600" />
              </button>

              {avatarMenuOpen && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 mt-2 w-40 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-2 z-20">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleAvatarFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl"
                  >
                    <Upload size={14} />
                    {uploadingAvatar ? 'Memproses...' : 'Ubah foto'}
                  </button>
                  {user?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      disabled={uploadingAvatar}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl"
                    >
                      <Trash2 size={14} />
                      Hapus foto
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold text-white truncate">{user?.name || 'Pengguna'}</h2>
              <p className="text-primary-100 text-sm truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 px-5 pb-8 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={sectionCard}
          >
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-700">
              <FieldLabel
                icon={User}
                label="Profil Pengguna"
                sub="Nama, email, dan foto profil yang tersimpan"
              />
            </div>
            <div className="p-4 space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2">Nama</label>
                  <input
                    value={profile.name}
                    onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-300 disabled:text-zinc-500 text-white font-semibold py-3.5 rounded-2xl transition"
              >
                {savingProfile ? 'Menyimpan...' : 'Simpan profil'}
                <Check size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={sectionCard}
          >
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-700">
              <FieldLabel
                icon={Wallet}
                label="Akun / Dompet"
                sub="Kelola rekening dan saldo awal yang dipakai dashboard"
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-950 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-primary-500">Total saldo tersimpan</p>
                  <p className="font-display text-lg font-bold text-primary-700 dark:text-primary-300">{formatRupiah(totalSaldo)}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center">
                  <Wallet size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
              </div>

              <div className="space-y-2">
                {accounts.map((acc) => {
                  const matched = ACCOUNT_OPTIONS.find(option => option.label.toLowerCase() === acc.name.toLowerCase())
                  const payment = matched || ACCOUNT_OPTIONS[0]
                  return (
                    <div key={acc.id} className="border border-zinc-100 dark:border-zinc-700 rounded-2xl p-3.5 bg-zinc-50 dark:bg-zinc-900">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                            <PayLogo method={payment} size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-white">Rekening</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">Nama akun dan saldo awal</p>
                          </div>
                        </div>
                        {accounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAccountRow(acc.id)}
                            className="text-zinc-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">Nama akun</label>
                          <select
                            value={acc.name}
                            onChange={e => updateAccountRow(acc.id, 'name', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          >
                            {ACCOUNT_OPTIONS.map(option => (
                              <option key={option.id} value={option.label}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">Saldo awal</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={acc.balance}
                            onChange={e => updateAccountRow(acc.id, 'balance', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={addAccountRow}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-semibold py-3 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-950 transition"
              >
                <Plus size={16} />
                Tambah akun / dompet
              </button>

              <button
                type="button"
                onClick={saveAccounts}
                disabled={savingAccounts}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-300 disabled:text-zinc-500 text-white font-semibold py-3.5 rounded-2xl transition"
              >
                {savingAccounts ? 'Menyimpan...' : 'Simpan rekening'}
                <Check size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={sectionCard}
          >
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-700">
              <FieldLabel
                icon={Lock}
                label="Ganti Password"
                sub="Perubahan ini disimpan ke akun yang sama"
              />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2">Password baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2">Konfirmasi password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="Ulangi password baru"
                />
              </div>

              <button
                type="button"
                onClick={savePassword}
                disabled={savingPassword}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-300 disabled:text-zinc-500 text-white font-semibold py-3.5 rounded-2xl transition"
              >
                {savingPassword ? 'Menyimpan...' : 'Simpan password'}
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatedPage>
    </Layout>
  )
}
