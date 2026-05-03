import api from './api'
import { DUMMY_TRANSACTIONS, getSummary } from '../utils/dummyData'

const USE_DUMMY = false

// Simulasi store lokal untuk dummy (biar bisa add/delete)
let localTransactions = [...DUMMY_TRANSACTIONS]

export async function getTransactionsAPI() {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 400))
    return [...localTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  const res = await api.get('/transactions')
  return res.data
}

export async function addTransactionAPI(data) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 500))
    const newTx = {
      id: 't' + Date.now(),
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
    }
    localTransactions.unshift(newTx)
    return newTx
  }
  const res = await api.post('/transactions', data)
  return res.data
}

export async function deleteTransactionAPI(id) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 300))
    localTransactions = localTransactions.filter(t => t.id !== id)
    return { message: 'Berhasil dihapus' }
  }
  const res = await api.delete(`/transactions/${id}`)
  return res.data
}

export async function getSummaryAPI() {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 300))
    return getSummary(localTransactions)
  }
  const res = await api.get('/transactions/summary')
  return res.data
}
