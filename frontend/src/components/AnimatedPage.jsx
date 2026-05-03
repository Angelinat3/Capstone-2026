import { motion } from 'framer-motion'

const variants = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: -8,  transition: { duration: 0.18 } },
}

export default function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className={className}>
      {children}
    </motion.div>
  )
}
