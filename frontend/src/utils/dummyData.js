// ============================================================
// DATA DUMMY — Backend Mengganti Dengan Api Call Nyata
// ============================================================

export const DUMMY_USER = {
  id: 'user-001',
  name: 'Dita',
  email: 'dita@example.com',
  avatar: null,
}

export const DUMMY_TOKEN = 'dummy-jwt-token-dita-12345'

export const CATEGORIES = [
  { id: 'makanan',    label: 'Makanan & Minuman', icon: '🍜', color: '#f97316' },
  { id: 'transport',  label: 'Transportasi',       icon: '🚗', color: '#3b82f6' },
  { id: 'belanja',    label: 'Belanja',             icon: '🛍️', color: '#ec4899' },
  { id: 'hiburan',    label: 'Hiburan',             icon: '🎮', color: '#8b5cf6' },
  { id: 'kesehatan',  label: 'Kesehatan',           icon: '💊', color: '#ef4444' },
  { id: 'pendidikan', label: 'Pendidikan',          icon: '📚', color: '#06b6d4' },
  { id: 'tagihan',    label: 'Tagihan',             icon: '💡', color: '#eab308' },
  { id: 'pemasukan',  label: 'Pemasukan',           icon: '💰', color: '#22c55e' },
  { id: 'lainnya',    label: 'Lainnya',             icon: '📦', color: '#6b7280' },
]

export const DUMMY_TRANSACTIONS = [
  { id: 't001', type: 'income',  amount: 2500000, category: 'pemasukan',  note: 'Beasiswa bulanan',      date: '2026-04-01', merchant: 'Dicoding' },
  { id: 't002', type: 'expense', amount: 35000,   category: 'makanan',    note: 'Makan siang warteg',    date: '2026-04-01', merchant: 'Warteg Bu Sri' },
  { id: 't003', type: 'expense', amount: 20000,   category: 'transport',  note: 'Ojek ke kampus',        date: '2026-04-02', merchant: 'Gojek' },
  { id: 't004', type: 'expense', amount: 150000,  category: 'belanja',    note: 'Beli kaos polos',       date: '2026-04-03', merchant: 'Tokopedia' },
  { id: 't005', type: 'expense', amount: 55000,   category: 'makanan',    note: 'Kopi + snack kerja',    date: '2026-04-04', merchant: 'Kopi Kenangan' },
  { id: 't006', type: 'income',  amount: 300000,  category: 'pemasukan',  note: 'Freelance desain logo', date: '2026-04-05', merchant: '-' },
  { id: 't007', type: 'expense', amount: 89000,   category: 'hiburan',    note: 'Nonton bioskop',        date: '2026-04-06', merchant: 'CGV' },
  { id: 't008', type: 'expense', amount: 45000,   category: 'makanan',    note: 'Makan malam bersama',   date: '2026-04-07', merchant: 'Warung Padang' },
  { id: 't009', type: 'expense', amount: 30000,   category: 'transport',  note: 'KRL bulanan',           date: '2026-04-08', merchant: 'KAI' },
  { id: 't010', type: 'expense', amount: 120000,  category: 'tagihan',    note: 'Bayar listrik',         date: '2026-04-09', merchant: 'PLN' },
  { id: 't011', type: 'expense', amount: 75000,   category: 'kesehatan',  note: 'Beli vitamin',          date: '2026-04-10', merchant: 'Apotek K24' },
  { id: 't012', type: 'expense', amount: 200000,  category: 'pendidikan', note: 'Beli buku pemrograman', date: '2026-04-11', merchant: 'Gramedia' },
  { id: 't013', type: 'income',  amount: 500000,  category: 'pemasukan',  note: 'Jualan produk digital', date: '2026-04-12', merchant: 'Gumroad' },
  { id: 't014', type: 'expense', amount: 6500,    category: 'makanan',    note: 'Beli donat',            date: '2026-04-13', merchant: 'Toko Roti' },
  { id: 't015', type: 'expense', amount: 65000,   category: 'hiburan',    note: 'Spotify + Netflix',     date: '2026-04-14', merchant: 'Subscription' },
  { id: 't016', type: 'expense', amount: 13000,   category: 'lainnya',    note: 'Iuran hadiah semhas',   date: '2026-04-15', merchant: '-' },
  { id: 't017', type: 'expense', amount: 110000,  category: 'belanja',    note: 'Skincare routine',      date: '2026-04-16', merchant: 'Sociolla' },
  { id: 't018', type: 'expense', amount: 30000,   category: 'makanan',    note: 'Indomie goreng set',    date: '2026-04-17', merchant: 'Warung Pojok' },
  { id: 't019', type: 'income',  amount: 150000,  category: 'pemasukan',  note: 'Cashback shopee',       date: '2026-04-18', merchant: 'Shopee' },
  { id: 't020', type: 'expense', amount: 85000,   category: 'makanan',    note: 'Dinner bersama teman',  date: '2026-04-19', merchant: 'Resto Pukis' },
]

export const MONTHLY_CHART_DATA = [
  { bulan: 'Nov', pemasukan: 2500000, pengeluaran: 1800000 },
  { bulan: 'Des', pemasukan: 3200000, pengeluaran: 2900000 },
  { bulan: 'Jan', pemasukan: 2500000, pengeluaran: 1600000 },
  { bulan: 'Feb', pemasukan: 2800000, pengeluaran: 2100000 },
  { bulan: 'Mar', pemasukan: 3000000, pengeluaran: 2400000 },
  { bulan: 'Apr', pemasukan: 3450000, pengeluaran: 1879000 },
]

export const CATEGORY_CHART_DATA = [
  { name: 'Makanan',    value: 255500, color: '#f97316' },
  { name: 'Transport',  value: 50000,  color: '#3b82f6' },
  { name: 'Belanja',    value: 260000, color: '#ec4899' },
  { name: 'Hiburan',    value: 154000, color: '#8b5cf6' },
  { name: 'Tagihan',    value: 120000, color: '#eab308' },
  { name: 'Kesehatan',  value: 75000,  color: '#ef4444' },
  { name: 'Pendidikan', value: 200000, color: '#06b6d4' },
  { name: 'Lainnya',    value: 108000, color: '#6b7280' },
]

export const DUMMY_REKOMENDASI = [
  {
    id: 'r001', type: 'warning', icon: '⚠️',
    title: 'Pengeluaran Makanan Meningkat',
    message: 'Pengeluaran makan & minuman kamu bulan ini Rp 255.500, naik 18% dari bulan lalu. Coba masak di rumah 2-3x seminggu untuk hemat hingga Rp 100.000.',
    category: 'makanan', savingEstimate: 100000,
  },
  {
    id: 'r002', type: 'tip', icon: '💡',
    title: 'Alokasi Tabungan Optimal',
    message: 'Dengan pemasukan Rp 3.450.000, idealnya kamu menabung minimal Rp 690.000 (20%). Saat ini kamu belum mencatat tabungan — coba buka rekening tabungan terpisah.',
    category: 'tabungan', savingEstimate: 690000,
  },
  {
    id: 'r003', type: 'alert', icon: '🔔',
    title: 'Langganan Berulang Terdeteksi',
    message: 'Kamu berlangganan Spotify + Netflix senilai Rp 65.000/bulan. Jika berbagi akun dengan teman, bisa hemat hingga 50%.',
    category: 'hiburan', savingEstimate: 32500,
  },
  {
    id: 'r004', type: 'good', icon: '✅',
    title: 'Rasio Keuangan Sehat!',
    message: 'Rasio pengeluaran vs pemasukan kamu bulan ini 54%. Kamu menghabiskan lebih sedikit dari yang dihasilkan. Pertahankan!',
    category: 'umum', savingEstimate: null,
  },
]

export const DUMMY_PREDIKSI = {
  beras: {
    label: 'Beras Premium (per kg)', satuan: 'kg',
    history: [
      { tanggal: 'Nov', harga: 13500 }, { tanggal: 'Des', harga: 13800 },
      { tanggal: 'Jan', harga: 14200 }, { tanggal: 'Feb', harga: 14000 },
      { tanggal: 'Mar', harga: 14500 }, { tanggal: 'Apr', harga: 14700, aktual: true },
    ],
    prediksi: [
      { tanggal: 'Mei', harga: 14900, prediksi: true },
      { tanggal: 'Jun', harga: 15100, prediksi: true },
      { tanggal: 'Jul', harga: 15000, prediksi: true },
    ],
    trend: 'naik', confidence: 82,
  },
  telur: {
    label: 'Telur Ayam (per kg)', satuan: 'kg',
    history: [
      { tanggal: 'Nov', harga: 26000 }, { tanggal: 'Des', harga: 27500 },
      { tanggal: 'Jan', harga: 28000 }, { tanggal: 'Feb', harga: 27000 },
      { tanggal: 'Mar', harga: 27800 }, { tanggal: 'Apr', harga: 28200, aktual: true },
    ],
    prediksi: [
      { tanggal: 'Mei', harga: 28500, prediksi: true },
      { tanggal: 'Jun', harga: 28000, prediksi: true },
      { tanggal: 'Jul', harga: 27800, prediksi: true },
    ],
    trend: 'stabil', confidence: 75,
  },
  minyak_goreng: {
    label: 'Minyak Goreng (per liter)', satuan: 'liter',
    history: [
      { tanggal: 'Nov', harga: 17500 }, { tanggal: 'Des', harga: 17200 },
      { tanggal: 'Jan', harga: 17800 }, { tanggal: 'Feb', harga: 18200 },
      { tanggal: 'Mar', harga: 18000 }, { tanggal: 'Apr', harga: 18500, aktual: true },
    ],
    prediksi: [
      { tanggal: 'Mei', harga: 18700, prediksi: true },
      { tanggal: 'Jun', harga: 19000, prediksi: true },
      { tanggal: 'Jul', harga: 18800, prediksi: true },
    ],
    trend: 'naik', confidence: 70,
  },
}

export function getSummary(transactions) {
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
}
