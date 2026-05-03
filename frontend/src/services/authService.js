import api from './api'
import { DUMMY_USER, DUMMY_TOKEN } from '../utils/dummyData'

// ================================================================
// MODE DUMMY: set USE_DUMMY = true selama backend belum siap
// Nanti tinggal ganti jadi false untuk pakai API sungguhan
// ================================================================
const USE_DUMMY = true

export async function loginAPI(email, password) {
  if (USE_DUMMY) {
    // Simulasi delay jaringan
    await new Promise(r => setTimeout(r, 800))
    if (email && password) {
      return { user: { ...DUMMY_USER, email }, token: DUMMY_TOKEN }
    }
    throw new Error('Email atau password salah')
  }
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function registerAPI(name, email, password) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 800))
    return { user: { id: 'user-new', name, email }, token: DUMMY_TOKEN }
  }
  const res = await api.post('/auth/register', { name, email, password })
  return res.data
}
