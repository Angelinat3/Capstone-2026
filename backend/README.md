# DompetKuy Backend API

REST API server untuk aplikasi DompetKuy — Express.js + Prisma + PostgreSQL.

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env → sesuaikan DATABASE_URL, JWT_SECRET

# 3. Generate Prisma client + migrate database
npx prisma migrate dev --name init

# 4. Seed data (opsional)
npm run seed

# 5. Jalankan server
npm run dev
```

Server berjalan di **http://localhost:3000**

## Endpoint Overview

### Auth
- `POST /auth/register` — Daftar user baru
- `POST /auth/login` — Login, return JWT
- `POST /auth/forgot-password` — Kirim email reset (placeholder)
- `PUT /auth/me` — Update profil (auth required)

### Transactions
- `GET /transactions` — List transaksi user
- `POST /transactions` — Tambah transaksi
- `DELETE /transactions/:id` — Hapus transaksi
- `GET /transactions/summary` — Ringkasan keuangan

### AI Proxy (forward ke FastAPI)
- `POST /ai/extract-transaction` — Ekstraksi teks → data transaksi
- `POST /ocr/upload` — Upload foto struk → OCR
- `GET /recommendations` — Rekomendasi keuangan AI
- `GET /predictions/price?commodity=x` — Prediksi harga sembako

## Test User (setelah seed)

```
Email:    dita@example.com
Password: password123
```
