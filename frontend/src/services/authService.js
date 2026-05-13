import api from './api'

export async function loginAPI(email, password) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function registerAPI(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data
}

export async function updateMeAPI(updates) {
  const res = await api.put('/auth/me', updates)
  return res.data
}
