const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Buat user test
  const password = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'dita@example.com' },
    update: {},
    create: {
      name: 'Dita',
      email: 'dita@example.com',
      password,
      accounts: [
        { name: 'Cash', balance: 500000 },
        { name: 'GoPay', balance: 150000 },
        { name: 'BCA', balance: 2000000 },
      ],
    },
  })

  console.log(`✅ User created: ${user.email}`)

  // Seed transaksi (matching dummy data dari frontend)
  const transactions = [
    { type: 'income',  amount: 2500000, category: 'pemasukan',  note: 'Beasiswa bulanan',      date: '2026-04-01', merchant: 'Dicoding',       payMethod: 'bni' },
    { type: 'expense', amount: 35000,   category: 'makanan',    note: 'Makan siang warteg',    date: '2026-04-01', merchant: 'Warteg Bu Sri',   payMethod: 'cash' },
    { type: 'expense', amount: 20000,   category: 'transport',  note: 'Ojek ke kampus',        date: '2026-04-02', merchant: 'Gojek',           payMethod: 'gopay' },
    { type: 'expense', amount: 150000,  category: 'belanja',    note: 'Beli kaos polos',       date: '2026-04-03', merchant: 'Tokopedia',       payMethod: 'bca' },
    { type: 'expense', amount: 55000,   category: 'makanan',    note: 'Kopi + snack kerja',    date: '2026-04-04', merchant: 'Kopi Kenangan',   payMethod: 'gopay' },
    { type: 'income',  amount: 300000,  category: 'pemasukan',  note: 'Freelance desain logo', date: '2026-04-05', merchant: '-',               payMethod: 'bca' },
    { type: 'expense', amount: 89000,   category: 'hiburan',    note: 'Nonton bioskop',        date: '2026-04-06', merchant: 'CGV',             payMethod: 'gopay' },
    { type: 'expense', amount: 45000,   category: 'makanan',    note: 'Makan malam bersama',   date: '2026-04-07', merchant: 'Warung Padang',   payMethod: 'cash' },
    { type: 'expense', amount: 30000,   category: 'transport',  note: 'KRL bulanan',           date: '2026-04-08', merchant: 'KAI',             payMethod: 'cash' },
    { type: 'expense', amount: 120000,  category: 'tagihan',    note: 'Bayar listrik',         date: '2026-04-09', merchant: 'PLN',             payMethod: 'bca' },
    { type: 'expense', amount: 75000,   category: 'kesehatan',  note: 'Beli vitamin',          date: '2026-04-10', merchant: 'Apotek K24',      payMethod: 'cash' },
    { type: 'expense', amount: 200000,  category: 'pendidikan', note: 'Beli buku pemrograman', date: '2026-04-11', merchant: 'Gramedia',        payMethod: 'cash' },
    { type: 'income',  amount: 500000,  category: 'pemasukan',  note: 'Jualan produk digital', date: '2026-04-12', merchant: 'Gumroad',         payMethod: 'bca' },
    { type: 'expense', amount: 6500,    category: 'makanan',    note: 'Beli donat',            date: '2026-04-13', merchant: 'Toko Roti',       payMethod: 'cash' },
    { type: 'expense', amount: 65000,   category: 'hiburan',    note: 'Spotify + Netflix',     date: '2026-04-14', merchant: 'Subscription',    payMethod: 'bca' },
    { type: 'expense', amount: 13000,   category: 'lainnya',    note: 'Iuran hadiah semhas',   date: '2026-04-15', merchant: '-',               payMethod: 'cash' },
    { type: 'expense', amount: 110000,  category: 'belanja',    note: 'Skincare routine',      date: '2026-04-16', merchant: 'Sociolla',        payMethod: 'shopeepay' },
    { type: 'expense', amount: 30000,   category: 'makanan',    note: 'Indomie goreng set',    date: '2026-04-17', merchant: 'Warung Pojok',    payMethod: 'cash' },
    { type: 'income',  amount: 150000,  category: 'pemasukan',  note: 'Cashback shopee',       date: '2026-04-18', merchant: 'Shopee',          payMethod: 'shopeepay' },
    { type: 'expense', amount: 85000,   category: 'makanan',    note: 'Dinner bersama teman',  date: '2026-04-19', merchant: 'Resto Pukis',     payMethod: 'cash' },
  ]

  // Hapus transaksi lama user ini, lalu insert ulang
  await prisma.transaction.deleteMany({ where: { userId: user.id } })

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        ...tx,
        date: new Date(tx.date),
        userId: user.id,
      },
    })
  }

  console.log(`✅ ${transactions.length} transaksi berhasil di-seed`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
