import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, LogOut, User, Moon, Sun, ChevronRight, Edit2, Camera, Shield, CreditCard, Banknote, Circle, Building, Trash2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import AnimatedPage from '../components/AnimatedPage'
import { staggerContainer, staggerItem } from '../utils/animations'
import { formatRupiah } from '../utils/helpers'
import { uploadAvatarAPI, deleteAvatarAPI } from '../services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const MenuItem = ({ icon: Icon, label, sub, onClick, danger, rightEl, color = 'text-zinc-500 dark:text-zinc-400' }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.01, x: 2 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-50 dark:border-zinc-700 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-750 ${danger ? 'hover:bg-red-50 dark:hover:bg-red-950' : ''}`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50 dark:bg-red-950' : 'bg-primary-50 dark:bg-primary-950'}`}>
      <Icon size={18} className={danger ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-zinc-800 dark:text-white'}`}>{label}</p>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{sub}</p>}
    </div>
    {rightEl || <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />}
  </motion.button>
)

export default function ProfilPage() {
  const { user, logout, updateUser } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [editName, setEditName] = useState(false)
  const [nameVal, setNameVal] = useState(user?.name || '')
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const saveName = () => {
    if (nameVal.trim()) updateUser({ name: nameVal.trim() })
    setEditName(false)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  const handleAvatarUpload = async (file) => {
    try {
      setUploading(true)
      const { user: updatedUser } = await uploadAvatarAPI(file)
      updateUser(updatedUser)
      setShowAvatarMenu(false)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('Gagal mengunggah foto profil')
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarDelete = async () => {
    try {
      const { user: updatedUser } = await deleteAvatarAPI()
      updateUser(updatedUser)
      setShowAvatarMenu(false)
    } catch (error) {
      console.error('Failed to delete avatar:', error)
      alert('Gagal menghapus foto profil')
    }
  }

  const totalSaldo = user?.accounts?.reduce((s, a) => s + (a.balance || 0), 0) || 0

  return (
    <Layout>
      <AnimatedPage>
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 pt-14 px-5 pb-20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={18} className="text-white" />
            </motion.button>
            <h1 className="font-display text-xl font-bold text-white">Profil</h1>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative mb-3"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-3xl font-bold text-white">
                    {(user?.name || 'D')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera size={13} className="text-primary-600" />
              </motion.button>

              {/* Avatar Menu */}
              <AnimatePresence>
                {showAvatarMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-2 min-w-[140px] z-20"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <Camera size={14} />
                      {uploading ? 'Mengunggah...' : 'Ganti Foto'}
                    </motion.button>
                    {user?.avatarUrl && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAvatarDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} />
                        Hapus Foto
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {editName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="bg-white/20 text-white text-center rounded-xl px-3 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                  autoFocus
                />
                <button onClick={saveName} className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl font-semibold">Simpan</button>
              </div>
            ) : (
              <button onClick={() => setEditName(true)} className="flex items-center gap-2 group">
                <h2 className="font-display text-xl font-bold text-white">{user?.name || 'Dita'}</h2>
                <Edit2 size={14} className="text-primary-200 group-hover:text-white transition" />
              </button>
            )}
            <p className="text-primary-200 text-sm mt-0.5">{user?.email || 'dita@example.com'}</p>
          </div>
        </div>

        {/* Saldo Cards */}
        <div className="px-5 -mt-10 relative z-10 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl shadow-card dark:border dark:border-zinc-700 p-4"
          >
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-3">REKENING & DOMPET</p>
            {user?.accounts?.length > 0 ? (
              <div className="space-y-2">
                {user.accounts.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {acc.name === 'Cash' ? <Banknote size={18} className="text-green-600" /> : acc.name === 'GoPay' ? <Circle size={18} className="text-green-500" /> : acc.name === 'OVO' ? <Circle size={18} className="text-purple-500" /> : acc.name === 'Dana' ? <Circle size={18} className="text-blue-500" /> : <Building size={18} className="text-zinc-600" />}
                      </span>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{acc.name}</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white">{formatRupiah(acc.balance || 0)}</span>
                  </div>
                ))}
                <div className="border-t border-zinc-100 dark:border-zinc-700 pt-2 mt-2 flex justify-between">
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Total</span>
                  <span className="font-display text-base font-bold text-primary-600 dark:text-primary-400">{formatRupiah(totalSaldo)}</span>
                </div>
              </div>
            ) : (
              <button onClick={() => navigate('/setup-saldo')}
                className="w-full text-center text-sm text-primary-600 dark:text-primary-400 font-semibold py-2">
                + Setup saldo rekening
              </button>
            )}
          </motion.div>
        </div>

        {/* Menu sections */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="px-5 space-y-5 mb-8"
        >
          {/* Akun */}
          <div>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 px-1 tracking-wide">AKUN</p>
            <div className="space-y-2">
              <motion.div variants={staggerItem}>
                <MenuItem icon={User} label="Settings" sub="Kelola profil, rekening, dan password" onClick={() => navigate('/settings')} />
              </motion.div>
              <motion.div variants={staggerItem}>
                <MenuItem icon={CreditCard} label="Kelola Rekening" sub="Setup saldo & metode pembayaran" onClick={() => navigate('/setup-saldo')} />
              </motion.div>
              <motion.div variants={staggerItem}>
                <MenuItem icon={Shield} label="Keamanan" sub="Password & verifikasi" onClick={() => navigate('/lupa-password')} />
              </motion.div>
            </div>
          </div>

          {/* Preferensi */}
          <div>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 px-1 tracking-wide">PREFERENSI</p>
            <div className="space-y-2">
              <motion.div variants={staggerItem}>
                <MenuItem
                  icon={dark ? Moon : Sun}
                  label="Tema Aplikasi"
                  sub={dark ? 'Mode Gelap aktif' : 'Mode Terang aktif'}
                  onClick={toggle}
                  rightEl={
                    <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${dark ? 'bg-primary-500' : 'bg-zinc-200'}`}>
                      <motion.div
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow"
                        animate={{ x: dark ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  }
                />
              </motion.div>

            </div>
          </div>



          {/* Logout */}
          <motion.div variants={staggerItem}>
            <MenuItem icon={LogOut} label="Keluar" sub="Logout dari akun ini" onClick={() => setShowLogoutModal(true)} danger />
          </motion.div>

          <p className="text-center text-xs text-zinc-300 dark:text-zinc-600 pb-2">DompetKuy v0.1.0 · CC26-PSU011</p>
        </motion.div>

        {/* Logout confirmation modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
              onClick={() => setShowLogoutModal(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 rounded-t-3xl w-full max-w-2xl p-6 pb-10"
              >
                <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-6" />
                <div className="w-14 h-14 bg-red-50 dark:bg-red-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogOut size={24} className="text-red-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-white text-center mb-2">Keluar dari DompetKuy?</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center mb-6">Data lokalmu akan tetap tersimpan. Kamu bisa masuk lagi kapan saja.</p>
                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition"
                  >
                    Ya, Keluar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold py-4 rounded-2xl transition"
                  >
                    Batal
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedPage>
    </Layout>
  )
}
