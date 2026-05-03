import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser  = localStorage.getItem('dk_user')
    const savedToken = localStorage.getItem('dk_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  const login = (userData, tokenValue) => {
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

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('dk_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
