import api from './api'
import { DUMMY_TRANSACTIONS, getSummary } from '../utils/dummyData'

const USE_DUMMY = false

let localTransactions = [...DUMMY_TRANSACTIONS]

/** Sama dengan backend: { status, message, data } */
function unwrapSuccess(res) {
  const body = res?.data
  if (body && typeof body === 'object' && body.data !== undefined) {
    return body.data
  }
  return body
}

export async function getTransactionsAPI() {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 400))
    return [...localTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  const res = await api.get('/transactions')
  const data = unwrapSuccess(res)
  if (Array.isArray(data)) return data
  return data?.transactions ?? []
}

export async function addTransactionAPI(payload) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 500))
    const newTx = {
      id: 't' + Date.now(),
      ...payload,
      date: payload.date || new Date().toISOString().split('T')[0],
    }
    localTransactions.unshift(newTx)
    return newTx
  }
  const res = await api.post('/transactions', payload)
  const inner = unwrapSuccess(res)
  return inner?.transaction ?? inner
}

export async function deleteTransactionAPI(id) {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 300))
    localTransactions = localTransactions.filter(t => t.id !== id)
    return { message: 'Berhasil dihapus' }
  }
  const res = await api.delete(`/transactions/${id}`)
  return unwrapSuccess(res)
}

export async function getSummaryAPI() {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 300))
    return getSummary(localTransactions)
  }
  const res = await api.get('/transactions/summary')
  return unwrapSuccess(res)
}
