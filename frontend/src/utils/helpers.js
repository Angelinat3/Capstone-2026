// Format angka ke Rupiah
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal ke bahasa Indonesia
export function formatTanggal(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Format tanggal pendek
export function formatTanggalPendek(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

// Cari info kategori berdasarkan id
export function getCategoryInfo(categoryId, categories) {
  return categories.find(c => c.id === categoryId) || {
    label: categoryId,
    icon: '📦',
    color: '#6b7280',
  }
}
