import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { formatRupiah } from '../utils/helpers'

const PAYMENT_METHODS = ['Cash','BNI','BCA','Mandiri','BRI','GoPay','OVO','Dana','ShopeePay','Lainnya']

export default function SetupSaldoPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Cash', balance: '' },
  ])

  const addAccount = () => {
    setAccounts(a => [...a, { id: Date.now(), name: 'BNI', balance: '' }])
  }

  const removeAccount = (id) => {
    setAccounts(a => a.filter(x => x.id !== id))
  }

  const updateAccount = (id, field, value) => {
    setAccounts(a => a.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  const totalSaldo = accounts.reduce((s, a) => s + (parseFloat(a.balance) || 0), 0)

  const handleSave = async () => {
    try {
      const saldoData = accounts.map(a => ({
        name: a.name,
        balance: parseFloat(a.balance) || 0,
      }))
      await updateUser({ accounts: saldoData, saldoSetupDone: true })
      navigate('/')
    } catch (error) {
      console.error('Failed to save saldo:', error)
      alert('Gagal menyimpan saldo. Silakan coba lagi.')
    }
  }

  const handleSkip = async () => {
    try {
      await updateUser({ saldoSetupDone: true })
      navigate('/')
    } catch (error) {
      console.error('Failed to skip setup:', error)
    }
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950 theme-transition flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-16 px-6 pb-10 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Wallet size={28} className="text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Setup Saldo Awal</h1>
        <p className="text-primary-200 text-sm">
          Masukkan saldo kamu saat ini agar dashboard lebih akurat
        </p>
      </div>

      <div className="flex-1 px-6 pt-6 pb-32 overflow-y-auto">
        {/* Total */}
        <div className="bg-primary-50 dark:bg-primary-950 rounded-2xl p-4 mb-5 text-center">
          <p className="text-xs text-primary-500 mb-1">Total Saldo Awal</p>
          <p className="font-display text-2xl font-bold text-primary-700 dark:text-primary-300">{formatRupiah(totalSaldo)}</p>
        </div>

        {/* Accounts */}
        <div className="space-y-3 mb-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">REKENING / DOMPET</p>
                {accounts.length > 1 && (
                  <button onClick={() => removeAccount(acc.id)} className="text-zinc-300 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select value={acc.name} onChange={e => updateAccount(acc.id, 'name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    value={acc.balance}
                    onChange={e => updateAccount(acc.id, 'balance', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    inputMode="numeric"
                  />
                </div>
              </div>
              {acc.balance > 0 && (
                <p className="text-xs text-zinc-400 mt-2 text-right">{formatRupiah(parseFloat(acc.balance))}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={addAccount}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-semibold py-3 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-950 transition text-sm">
          <Plus size={16} /> Tambah Rekening / Dompet
        </button>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 pb-8 pt-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        <button onClick={handleSave}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-100 transition">
          Simpan & Mulai <ArrowRight size={18} />
        </button>
        <button onClick={handleSkip}
          className="w-full text-zinc-400 dark:text-zinc-500 text-sm font-medium py-2">
          Lewati, setup nanti
        </button>
      </div>
    </div>
  )
}
