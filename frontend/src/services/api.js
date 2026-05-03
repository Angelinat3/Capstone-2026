import axios from 'axios'

// ================================================================
// Konfigurasi base URL Axios
// Ubah VITE_API_URL di file .env setelah backend selesai dibuat
// ================================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
})

// Otomatis sisipkan JWT token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dk_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle error global (misal token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dk_token')
      localStorage.removeItem('dk_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
