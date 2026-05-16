import api from './api'

/** Backend success shape: { status, message, data } — return inner `data` when present */
function unwrapSuccess(res) {
  const body = res?.data
  if (body && typeof body === 'object' && body.data !== undefined) {
    return body.data
  }
  return body
}

function throwApiMessage(err) {
  const msg = err.response?.data?.message
  if (msg) {
    throw new Error(msg)
  }
  throw err
}

export async function loginAPI(email, password) {
  try {
    const res = await api.post('/auth/login', { email, password })
    return unwrapSuccess(res)
  } catch (err) {
    throwApiMessage(err)
  }
}

export async function registerAPI(name, email, password) {
  try {
    const res = await api.post('/auth/register', { name, email, password })
    return unwrapSuccess(res)
  } catch (err) {
    throwApiMessage(err)
  }
}

export async function updateMeAPI(updates) {
  const res = await api.put('/auth/me', updates)
  return unwrapSuccess(res)
}

export async function uploadAvatarAPI(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  const res = await api.post('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return unwrapSuccess(res)
}

export async function deleteAvatarAPI() {
  const res = await api.delete('/auth/avatar')
  return unwrapSuccess(res)
}
