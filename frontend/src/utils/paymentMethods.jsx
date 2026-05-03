/**
 * PAYMENT METHODS — DompetKuy
 * 
 * Logo images diletakkan di: public/images/
 *   - gopay.png, ovo.png, dana.png, shopeepay.png
 *   - (bank & cash menggunakan emoji fallback)
 * 
 * Digunakan di: TambahPage.jsx, TransaksiPage.jsx
 * Field yang dikirim ke backend: payMethod (string id)
 */

// Helper render logo: gambar jika ada, fallback emoji
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
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{method.icon}</span>
}

export const PAYMENT_GROUPS = [
  {
    group: 'Tunai',
    items: [
      { id: 'cash', label: 'Cash', icon: '💵', hasLogo: false },
    ],
  },
  {
    group: 'Transfer Bank',
    items: [
      { id: 'bni',     label: 'BNI',     icon: '🏦', hasLogo: false },
      { id: 'bca',     label: 'BCA',     icon: '🏦', hasLogo: false },
      { id: 'mandiri', label: 'Mandiri', icon: '🏦', hasLogo: false },
      { id: 'bri',     label: 'BRI',     icon: '🏦', hasLogo: false },
      { id: 'bsi',     label: 'BSI',     icon: '🏦', hasLogo: false },
      { id: 'cimb',    label: 'CIMB',    icon: '🏦', hasLogo: false },
      { id: 'danamon', label: 'Danamon', icon: '🏦', hasLogo: false },
      { id: 'permata', label: 'Permata', icon: '🏦', hasLogo: false },
    ],
  },
  {
    group: 'E-Wallet',
    items: [
      { id: 'gopay',     label: 'GoPay',     icon: '💚', hasLogo: true },
      { id: 'ovo',       label: 'OVO',       icon: '💜', hasLogo: true },
      { id: 'dana',      label: 'DANA',      icon: '💙', hasLogo: true },
      { id: 'shopeepay', label: 'ShopeePay', icon: '🧡', hasLogo: true },
    ],
  },
  {
    group: 'Kartu Kredit',
    items: [
      { id: 'cc_visa',       label: 'Visa',       icon: '💳', hasLogo: false },
      { id: 'cc_mastercard', label: 'Mastercard', icon: '💳', hasLogo: false },
      { id: 'cc_jcb',        label: 'JCB',        icon: '💳', hasLogo: false },
      { id: 'cc_amex',       label: 'Amex',       icon: '💳', hasLogo: false },
    ],
  },
]

export const ALL_PAYMENTS = PAYMENT_GROUPS.flatMap(g => g.items)

export function getPayment(id) {
  return ALL_PAYMENTS.find(p => p.id === id) || ALL_PAYMENTS[0]
}
