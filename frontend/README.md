# **DompetKuy — Dokumentasi Frontend \& Panduan Integrasi Backend**

> CC26-PSU011| Coding Camp 2026 Powered by DBS Foundation  
> Tema: Revolusi Teknologi Keuangan (Fintech) untuk Generasi Muda



## 📌 Daftar Isi

1. [Deskripsi Proyek](#1-deskripsi-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Cara Menjalankan Proyek](#3-cara-menjalankan-proyek)
4. [Konfigurasi Base URL API](#4-konfigurasi-base-url-api)
5. [Autentikasi — Bearer Token (JWT)](#5-autentikasi--bearer-token-jwt)
6. [Daftar Endpoint yang Dibutuhkan](#6-daftar-endpoint-yang-dibutuhkan)
7. [Endpoint AI Service (Tim AI Engineer)](#7-endpoint-ai-service-tim-ai-engineer)
8. [Catatan Data Dummy](#8-catatan-data-dummy)
9. [Langkah Selanjutnya untuk Backend Developer](#9-langkah-selanjutnya-untuk-backend-developer)



## 1\. Deskripsi Proyek

**DompetKuy** adalah aplikasi web pencatat keuangan pribadi berbasis AI yang ditujukan untuk generasi muda.

### Fitur Utama

|Fitur|Status FE|Keterangan|
|-|-|-|
|Autentikasi (Login/Register)|✅ Final|Butuh endpoint JWT dari Backend|
|Login dengan Google OAuth|✅ UI siap|Butuh endpoint `/auth/google` dari Backend|
|Lupa Password|✅ UI siap|Butuh endpoint `/auth/forgot-password`|
|Dashboard Keuangan|✅ Final|Butuh data transaksi dari Backend|
|Catat Transaksi Manual|✅ Final|Butuh CRUD dari Backend|
|AI DompetKuy (chat input)|✅ Final|Butuh endpoint ekstraksi dari AI Engineer|
|Upload Foto Struk (OCR)|✅ Final|Butuh endpoint OCR dari AI Engineer|
|Laporan Keuangan (Minggu/Bulan/Tahun)|✅ Final|Berdasarkan data transaksi|
|Rekomendasi AI|✅ Final|Butuh endpoint rekomendasi dari AI Engineer|
|Prediksi Harga Sembako|✅ Final|Butuh endpoint prediksi dari AI Engineer|
|Logout|✅ Final|masih perlu diatur routenya|
|Setup Saldo Awal|✅ Final|Butuh endpoint update user dari Backend|
|Dark / Light Mode|✅ Final|Disimpan di localStorage|



## 2\. Tech Stack


```
React 18        — UI library
Vite 5          — Build tool \& dev server
Tailwind CSS 3  — Utility-first styling
React Router 6  — Client-side routing
Axios           — HTTP client untuk API calls
Recharts        — Grafik \& visualisasi data
Framer Motion   — Animasi \& page transition
Lucide React    — Icon library
```


## 3\. Cara Menjalankan Proyek

### Prasyarat

* **Node.js** versi 18 atau lebih baru → [nodejs.org](https://nodejs.org)
* **npm** (sudah termasuk bersama Node.js)

### Langkah Install

```bash
# 1. Clone atau ekstrak folder proyek
cd dompet-kuy

# 2. Install semua dependensi
npm install

# 3. Salin file environment
cp .env.example .env

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:5173**



## 4. Konfigurasi Base URL API



Buat file `.env` di root proyek (salin dari `.env.example`):



```env
# URL base backend — ganti sesuai URL deploy backend
VITE_API_URL=http://localhost:3000

# URL AI Service (jika terpisah dari backend utama)
VITE_AI_API_URL=http://localhost:8000
```

File Axios base config ada di: `src/services/api.js`

```js
// src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE\_API\_URL,
  timeout: 10000,
})
```

Untuk beralih dari **mode dummy ke API sungguhan**, ubah konstanta di masing-masing service file:

```js
// src/services/authService.js
const USE\_DUMMY = false  // ← ubah dari true ke false
```

Service files yang perlu diubah:

* `src/services/authService.js`
* `src/services/transactionService.js`
* `src/services/aiService.js`

\---

## 5\. Autentikasi — Bearer Token (JWT)

Frontend menggunakan **JWT Bearer Token** untuk semua request yang memerlukan autentikasi.

### Alur Autentikasi

```
1. User login → POST /auth/login
2. Backend return: { token: "jwt\\\_string", user: {...} }
3. Frontend simpan token di localStorage (key: "dk\\\_token")
4. Setiap request selanjutnya otomatis menyertakan header:
   Authorization: Bearer <token>
```

### Header yang Dikirim

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Protected Routes

Semua route kecuali `/login`, `/register`, `/lupa-password` adalah protected. Jika backend mengembalikan HTTP `401`, frontend akan otomatis redirect user ke halaman login.

\---

## 6\. Daftar Endpoint yang Dibutuhkan

> 📌 \\\*\\\*Konvensi:\\\*\\\* Semua endpoint menggunakan prefix `/api/v1` (sesuaikan dengan Backend).  
> Response selalu dalam format JSON. Field yang bertanda `\\\*` bersifat opsional.

\---

### 🔐 Auth

#### `POST /auth/register`

Mendaftarkan user baru.

**Request Body:**

```json
{
  "name": "Dita",
  "email": "dita@email.com",
  "password": "rahasia123"
}
```

**Response `201`:**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "user-uuid",
    "name": "Dita",
    "email": "dita@email.com",
    "created\\\_at": "2026-04-23T10:00:00Z"
  }
}
```

\---

#### `POST /auth/login`

Login dengan email dan password.

**Request Body:**

```json
{
  "email": "dita@email.com",
  "password": "rahasia123"
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "user-uuid",
    "name": "Dita",
    "email": "dita@email.com"
  }
}
```

**Response `401` (gagal):**

```json
{
  "message": "Email atau password salah"
}
```

\---

#### `POST /auth/google`

Login / Register menggunakan Google OAuth.

**Request Body:**

```json
{
  "access\\\_token": "google\\\_oauth\\\_access\\\_token"
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "user-uuid",
    "name": "Dita Pratiwi",
    "email": "dita@gmail.com",
    "avatar\\\_url": "https://..."
  }
}
```

> 📝 Frontend menggunakan library `@react-oauth/google`. Backend perlu memvalidasi `access\\\_token` ke Google API, lalu membuat atau mengambil user yang sesuai dan mengembalikan JWT.

\---

#### `POST /auth/forgot-password`

Kirim email reset password.

**Request Body:**

```json
{
  "email": "dita@email.com"
}
```

**Response `200`:**

```json
{
  "message": "Email reset password telah dikirim"
}
```

\---

#### `PUT /auth/me`

Update data profil user (nama, dll). Memerlukan token.

**Request Body:**

```json
{
  "name": "Dita Pratiwi",
  "accounts": \\\[
    { "name": "Cash", "balance": 500000 },
    { "name": "GoPay", "balance": 150000 }
  ]
}
```

**Response `200`:**

```json
{
  "user": {
    "id": "user-uuid",
    "name": "Dita Pratiwi",
    "email": "dita@email.com",
    "accounts": \\\[
      { "name": "Cash", "balance": 500000 },
      { "name": "GoPay", "balance": 150000 }
    ]
  }
}
```

\---

### 💳 Transaksi

#### `GET /transactions`

Mengambil semua transaksi milik user yang sedang login. Memerlukan token.

**Query Params (opsional):**

```
?type=expense          → filter pemasukan/pengeluaran
?category=makanan      → filter per kategori
?start\\\_date=2026-04-01 → filter tanggal mulai
?end\\\_date=2026-04-30   → filter tanggal akhir
?limit=50              → batas jumlah data
```

**Response `200`:**

```json
\\\[
  {
    "id": "tx-uuid-001",
    "user\\\_id": "user-uuid",
    "type": "expense",
    "amount": 35000,
    "category": "makanan",
    "note": "Makan siang warteg",
    "merchant": "Warteg Bu Sri",
    "date": "2026-04-01",
    "pay\\\_method": "cash",
    "created\\\_at": "2026-04-01T12:30:00Z"
  }
]
```

\---

#### `POST /transactions`

Menambahkan transaksi baru. Memerlukan token.

**Request Body:**

```json
{
  "type": "expense",
  "amount": 35000,
  "category": "makanan",
  "note": "Makan siang warteg",
  "merchant": "Warteg Bu Sri",
  "date": "2026-04-01",
  "pay\\\_method": "cash"
}
```

> \\\*\\\*Nilai valid untuk `category`:\\\*\\\*  
> `makanan` | `transport` | `belanja` | `hiburan` | `kesehatan` | `pendidikan` | `tagihan` | `pemasukan` | `lainnya`

> \\\*\\\*Nilai valid untuk `pay\\\_method`:\\\*\\\*  
> `cash` | `bni` | `bca` | `mandiri` | `bri` | `bsi` | `cimb` | `danamon` | `permata` | `gopay` | `ovo` | `dana` | `shopeepay` | `cc\\\_visa` | `cc\\\_mastercard` | `cc\\\_jcb` | `cc\\\_amex`

**Response `201`:**

```json
{
  "id": "tx-uuid-baru",
  "type": "expense",
  "amount": 35000,
  "category": "makanan",
  "note": "Makan siang warteg",
  "merchant": "Warteg Bu Sri",
  "date": "2026-04-01",
  "pay\\\_method": "cash",
  "created\\\_at": "2026-04-23T14:22:00Z"
}
```

\---

#### `DELETE /transactions/:id`

Menghapus transaksi berdasarkan ID. Memerlukan token.

**Response `200`:**

```json
{
  "message": "Transaksi berhasil dihapus"
}
```

**Response `404`:**

```json
{
  "message": "Transaksi tidak ditemukan"
}
```

\---

#### `GET /transactions/summary`

Ringkasan keuangan user (untuk dashboard). Memerlukan token.

**Query Params (opsional):**

```
?month=4\\\&year=2026   → ringkasan bulan tertentu
```

**Response `200`:**

```json
{
  "total\\\_income": 3450000,
  "total\\\_expense": 1879000,
  "balance": 1571000,
  "by\\\_category": \\\[
    { "category": "makanan",   "total": 368000 },
    { "category": "transport", "total": 75000  }
  ]
}
```

\---

### 📊 Laporan

#### `GET /transactions/report`

Data transaksi untuk laporan keuangan dengan filter periode. Memerlukan token.

**Query Params:**

```
?period=weekly\\\&week=18\\\&year=2026    → laporan mingguan (ISO week)
?period=monthly\\\&month=4\\\&year=2026   → laporan bulanan
?period=yearly\\\&year=2026            → laporan tahunan
```

**Response `200`:**

```json
{
  "period": "monthly",
  "label": "April 2026",
  "total\\\_income": 3450000,
  "total\\\_expense": 1879000,
  "transactions": \\\[ ...array transaksi... ],
  "chart\\\_data": \\\[
    { "label": "Mg 1 (1-7)", "income": 1200000, "expense": 450000 },
    { "label": "Mg 2 (8-14)", "income": 800000, "expense": 620000 }
  ],
  "by\\\_category": \\\[
    { "category": "makanan", "total": 368000, "percentage": 19.6 }
  ]
}
```

> 📝 Frontend saat ini menghitung laporan secara lokal dari data `/transactions`. Endpoint ini bersifat opsional namun disarankan untuk performa lebih baik.





\---



\---





\---





\---

## 7\. Endpoint AI Service (Tim AI Engineer)

> ⚠️ Endpoint berikut dikerjakan oleh AI Engineer dan akan di-consume oleh Backend sebagai proxy



`POST /ai/extract-transaction`

Mengekstrak informasi transaksi dari teks natural language user.

**Lokasi di Frontend:** `src/pages/TransaksiPage.jsx` → fungsi `extractFromAI()`

**Request Body:**

```json
{
  "text": "beli kopi 25rb pakai gopay di Kopi Kenangan"
}
```

**Expected Response:**

```json
{
  "amount": 25000,
  "category": "makanan",
  "merchant": "Kopi Kenangan",
  "pay\\\_method": "gopay",
  "note": "beli kopi 25rb pakai gopay di Kopi Kenangan",
  "type": "expense",
  "confidence": 0.92
}
```

\---

### `POST /ai/ocr-invoice`

Membaca dan mengekstrak data dari foto struk/invoice.

**Lokasi di Frontend:** `src/services/aiService.js` → fungsi `uploadInvoiceAPI()`

**Request:** `multipart/form-data`

```
invoice: <file gambar JPG/PNG>
```

**Expected Response:**

```json
{
  "merchant": "Indomaret",
  "date": "2026-04-23",
  "total": 45500,
  "items": \\\["Indomie Goreng x2", "Teh Botol x1"],
  "category": "makanan",
  "confidence": 0.91
}
```

\---

### `GET /ai/recommendations`

Rekomendasi keuangan personal berdasarkan histori transaksi user.

**Lokasi di Frontend:** `src/services/aiService.js` → fungsi `getRekomendasiAPI()`

**Expected Response:**

```json
\\\[
  {
    "id": "rec-001",
    "type": "warning",
    "icon": "⚠️",
    "title": "Pengeluaran Makanan Meningkat",
    "message": "Pengeluaran makanan naik 23% bulan ini...",
    "category": "makanan",
    "saving\\\_estimate": 100000
  }
]
```

> \\\*\\\*Nilai valid untuk `type`:\\\*\\\* `warning` | `alert` | `tip` | `good`

&#x09;

### `GET /ai/predict-price`

Prediksi harga sembako 3 bulan ke depan.

**Lokasi di Frontend:** `src/services/aiService.js` → fungsi `getPrediksiHargaAPI()`

**Query Params:**

```
?commodity=beras         → beras | telur | minyak\\\_goreng
```

**Expected Response:**

```json
{
  "label": "Beras Premium (per kg)",
  "satuan": "kg",
  "history": \\\[
    { "tanggal": "Nov", "harga": 13500 },
    { "tanggal": "Apr", "harga": 14700, "aktual": true }
  ],
  "prediksi": \\\[
    { "tanggal": "Mei", "harga": 14900, "prediksi": true },
    { "tanggal": "Jun", "harga": 15100, "prediksi": true }
  ],
  "trend": "naik",
  "confidence": 82
}
```



## 8\. Catatan Data Dummy

Beberapa data masih menggunakan **dummy**. Backend diharapkan menyesuaikan format response seperti yang tertulis di atas.

|File|Fungsi Dummy|Ganti dengan|
|-|-|-|
|`src/services/authService.js`|`loginAPI()`, `registerAPI()`|Endpoint `/auth/login`, `/auth/register`|
|`src/services/transactionService.js`|`getTransactionsAPI()`, `addTransactionAPI()`, `deleteTransactionAPI()`|Endpoint `/transactions`|
|`src/services/aiService.js`|`getRekomendasiAPI()`, `getPrediksiHargaAPI()`, `uploadInvoiceAPI()`|Endpoint AI Service|
|`src/pages/TransaksiPage.jsx`|Fungsi `extractFromAI()` (baris \~15–70)|`POST /ai/extract-transaction`|
|`src/utils/dummyData.js`|Semua konstanta `DUMMY\\\_\\\*`|Tidak perlu diubah, hanya untuk fallback UI|

**Cara beralih ke API sungguhan (per service):**

```js
// Ubah baris ini di file service masing-masing
const USE\\\_DUMMY = true   // ← ganti ke: false
```







## 9\. Langkah Selanjutnya untuk Backend Developer

Berikut adalah urutan prioritas pekerjaan Backend yang perlu diselesaikan agar Frontend dapat berjalan penuh:

### 🔴 Prioritas Tinggi (Wajib untuk MVP)

* \[ ] **Setup project Express.js** — middleware (CORS, body-parser, helmet), konfigurasi Supabase/PostgreSQL
* \[ ] **Implementasi autentikasi JWT** — endpoint `/auth/register` dan `/auth/login`, hashing password dengan bcrypt, JWT sign \& verify
* \[ ] **CRUD Transaksi** — endpoint `GET /transactions`, `POST /transactions`, `DELETE /transactions/:id` dengan validasi input dan otorisasi berbasis token
* \[ ] **Set CORS** — izinkan origin dari `http://localhost:5173` (development) dan domain Vercel (production)
* \[ ] **Skema database** — tabel `users`, `transactions` dengan kolom sesuai field di Bagian 6

### 🟡 Prioritas Sedang

* \[ ] **Google OAuth** — endpoint `POST /auth/google`, validasi token dengan Google API (`https://www.googleapis.com/oauth2/v1/userinfo`)
* \[ ] **Lupa Password** — endpoint `POST /auth/forgot-password`, kirim email via nodemailer atau layanan email
* \[ ] **Update Profil** — endpoint `PUT /auth/me` untuk nama dan data rekening/saldo
* \[ ] **Summary Dashboard** — endpoint `GET /transactions/summary` dengan agregasi per kategori
* \[ ] **Dokumentasi API** — buat Swagger/OpenAPI documentation, simpan di `/api-docs`

### 🟢 Prioritas Opsional (Side Quest / Nilai Tambah)

* \[ ] **Laporan endpoint** — `GET /transactions/report` dengan filter period (opsional, FE bisa hitung sendiri)
* \[ ] **Pagination transaksi** — tambahkan `limit` dan `offset` pada `GET /transactions`
* \[ ] **Proxy AI endpoint** — jika AI service berdiri terpisah (FastAPI), Backend bisa bertindak sebagai proxy agar FE hanya perlu satu base URL
* \[ ] **Supabase Storage** — untuk menyimpan foto struk yang diupload user (opsional, saat ini FE kirim langsung ke AI service)
* \[ ] **Refresh Token** — implementasi endpoint `/auth/refresh` untuk perpanjang sesi tanpa login ulang
* \[ ] **Deploy ke Railway/Render** — pastikan environment variable tersetting, termasuk `DATABASE\\\_URL`, `JWT\\\_SECRET`, `GOOGLE\\\_CLIENT\\\_ID`

### 📬 Koordinasi dengan Tim AI Engineer

Backend perlu berkoordinasi dengan AI Engineer untuk:

1. **Kontrak API ekstraksi transaksi** — request/response schema `POST /ai/extract-transaction`
2. **Proxy OCR** — Backend sebagai perantara upload file dari FE ke AI service OCR
3. **Rekomendasi keuangan** — Backend bisa trigger generate rekomendasi setiap kali ada transaksi baru, atau on-demand dari FE
4. **Prediksi sembako** — Backend bisa cache hasil prediksi (misal 1 hari) agar tidak selalu hit AI service









> 💡 \\\*\\\*Catatan:\\\*\\\* Semua perubahan API sebaiknya didiskusikan terlebih dahulu sebelum diimplementasi agar tidak mengganggu alur development.



*Terakhir diperbarui: April 2026*

