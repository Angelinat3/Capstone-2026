// ── Framer Motion shared animation variants ──

export const pageVariants = {
  initial:  { opacity: 0, y: 18 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export const fadeUp = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: 'easeOut' },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } }
}

export const staggerItem = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const cardHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.15 } },
  whileTap:   { scale: 0.97 },
}

export const slideInLeft = {
  initial:  { opacity: 0, x: -20 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export const slideInRight = {
  initial:  { opacity: 0, x: 20 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export const scaleIn = {
  initial:  { opacity: 0, scale: 0.92 },
  animate:  { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}
