/**
 * PAYMENT METHODS — DompetKuy
 *
 * Logo images diletakkan di: public/images/
 *   - gopay.png, ovo.png, dana.png, shopeepay.png
 *   - (bank & cash menggunakan icon fallback)
 *
 * Digunakan di: TambahPage.jsx, TransaksiPage.jsx
 * Field yang dikirim ke backend: payMethod (string id)
 */

import { Banknote, Building, Circle, CreditCard } from 'lucide-react'

// Helper render logo: gambar jika ada, fallback icon
export function PayLogo({ method, size = 24, className = '' }) {
  const IMAGE_IDS = ['gopay', 'ovo', 'dana', 'shopeepay']
  if (IMAGE_IDS.includes(method.id)) {
    return (
      <img
        src={`/images/${method.id}.png`}
        alt={method.label}
        style={{ width: size, height: size }}
        className={`object-contain ${className}`}
        onError={e => {
          e.target.style.display = 'none'
          if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline'
        }}
      />
    )
  }
  const Icon = method.icon
  return <Icon size={size} className={className} />
}

export const PAYMENT_GROUPS = [
  {
    group: 'Tunai',
    items: [
      { id: 'cash', label: 'Cash', icon: Banknote, hasLogo: false },
    ],
  },
  {
    group: 'Transfer Bank',
    items: [
      { id: 'bni',     label: 'BNI',     icon: Building, hasLogo: false },
      { id: 'bca',     label: 'BCA',     icon: Building, hasLogo: false },
      { id: 'mandiri', label: 'Mandiri', icon: Building, hasLogo: false },
      { id: 'bri',     label: 'BRI',     icon: Building, hasLogo: false },
      { id: 'bsi',     label: 'BSI',     icon: Building, hasLogo: false },
      { id: 'cimb',    label: 'CIMB',    icon: Building, hasLogo: false },
      { id: 'danamon', label: 'Danamon', icon: Building, hasLogo: false },
      { id: 'permata', label: 'Permata', icon: Building, hasLogo: false },
    ],
  },
  {
    group: 'E-Wallet',
    items: [
      { id: 'gopay',     label: 'GoPay',     icon: Circle, hasLogo: true },
      { id: 'ovo',       label: 'OVO',       icon: Circle, hasLogo: true },
      { id: 'dana',      label: 'DANA',      icon: Circle, hasLogo: true },
      { id: 'shopeepay', label: 'ShopeePay', icon: Circle, hasLogo: true },
    ],
  },
  {
    group: 'Kartu Kredit',
    items: [
      { id: 'cc_visa',       label: 'Visa',       icon: CreditCard, hasLogo: false },
      { id: 'cc_mastercard', label: 'Mastercard', icon: CreditCard, hasLogo: false },
      { id: 'cc_jcb',        label: 'JCB',        icon: CreditCard, hasLogo: false },
      { id: 'cc_amex',       label: 'Amex',       icon: CreditCard, hasLogo: false },
    ],
  },
]

export const ALL_PAYMENTS = PAYMENT_GROUPS.flatMap(g => g.items)

export function getPayment(id) {
  return ALL_PAYMENTS.find(p => p.id === id) || ALL_PAYMENTS[0]
}
