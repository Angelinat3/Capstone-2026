import BottomNav from './BottomNav'

/**
 * Mobile-first layout with desktop sidebar expansion.
 * On mobile  → content fills screen, BottomNav fixed at bottom.
 * On desktop → centered max-w container with full-width header bands.
 */
export default function Layout({ children, hideNav = false, fullBleed = false }) {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 theme-transition">
      {/* Desktop: constrain content width but allow header gradient to bleed */}
      <div className={fullBleed ? '' : 'max-w-2xl mx-auto relative'}>
        <main className={`pb-24 ${fullBleed ? '' : ''}`}>
          {children}
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  )
}
