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

export async function uploadAvatarAPI(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  const res = await api.post('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export async function deleteAvatarAPI() {
  const res = await api.delete('/auth/avatar')
  return res.data
}
