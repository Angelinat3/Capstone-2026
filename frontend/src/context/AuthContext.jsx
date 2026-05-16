import { createContext, useContext, useState, useEffect } from 'react'
import { updateMeAPI } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('dk_user')
    const savedToken = localStorage.getItem('dk_token')
    const badToken =
      !savedToken ||
      savedToken === 'undefined' ||
      savedToken === 'null'

    if (savedUser && savedUser !== 'undefined' && !badToken) {
      try {
        const parsed = JSON.parse(savedUser)
        if (parsed && typeof parsed === 'object' && parsed.id) {
          setUser(parsed)
          setToken(savedToken)
        } else {
          localStorage.removeItem('dk_user')
          localStorage.removeItem('dk_token')
        }
      } catch {
        localStorage.removeItem('dk_user')
        localStorage.removeItem('dk_token')
      }
    } else if (badToken || savedUser === 'undefined') {
      localStorage.removeItem('dk_user')
      localStorage.removeItem('dk_token')
    }
    setLoading(false)
  }, [])

  const login = (userData, tokenValue) => {
    if (!userData?.id || !tokenValue || tokenValue === 'undefined') {
      console.error('[Auth] login dipanggil tanpa user/token valid')
      return
    }
    setUser(userData)
    setToken(tokenValue)
    localStorage.setItem('dk_user', JSON.stringify(userData))
    localStorage.setItem('dk_token', tokenValue)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('dk_user')
    localStorage.removeItem('dk_token')
  }

  const updateUser = async (updates) => {
    try {
      // Jika updates sudah berisi user object lengkap (dari uploadAvatar/dari API), langsung pakai
      if (updates.id) {
        const updated = { ...user, ...updates }
        setUser(updated)
        localStorage.setItem('dk_user', JSON.stringify(updated))
        return
      }
      // Kalau tidak, panggil API seperti biasa
      const { user: updatedUser } = await updateMeAPI(updates)
      const updated = { ...user, ...updatedUser, ...updates }
      setUser(updated)
      localStorage.setItem('dk_user', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
