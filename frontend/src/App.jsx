import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import LupaPasswordPage from './pages/LupaPasswordPage'
import SetupSaldoPage   from './pages/SetupSaldoPage'
import DashboardPage    from './pages/DashboardPage'
import TransaksiPage    from './pages/TransaksiPage'
import TambahPage       from './pages/TambahPage'
import LaporanPage      from './pages/LaporanPage'
import RekomendasiPage  from './pages/RekomendasiPage'
import PrediksiPage     from './pages/PrediksiPage'
import ProfilPage       from './pages/ProfilPage'
import SettingsPage     from './pages/SettingsPage'

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />
        <Route path="/lupa-password" element={<LupaPasswordPage />} />
        <Route path="/setup-saldo"   element={<P><SetupSaldoPage /></P>} />
        <Route path="/"              element={<P><DashboardPage /></P>} />
        <Route path="/transaksi"     element={<P><TransaksiPage /></P>} />
        <Route path="/tambah"        element={<P><TambahPage /></P>} />
        <Route path="/laporan"       element={<P><LaporanPage /></P>} />
        <Route path="/rekomendasi"   element={<P><RekomendasiPage /></P>} />
        <Route path="/prediksi"      element={<P><PrediksiPage /></P>} />
        <Route path="/profil"        element={<P><ProfilPage /></P>} />
        <Route path="/settings"      element={<P><SettingsPage /></P>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}
