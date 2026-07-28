import type { ReactNode } from "react"

export default function ApiNav({
  navTitle,
  bookingStatus,
  children,
  bgColor,
  isDark,
  setDark
}: {
  navTitle: string
  bookingStatus: string
  children: ReactNode
  isDark: boolean
  bgColor: string
  setDark: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <>
      <nav className="w-full flex justify-between items-center px-6 md:px-16 py-4 bg-white dark:bg-brand-blue-900 transition-colors border-b border-brand-grey-400/20 dark:border-white/10">
        <h3 className="text-2xl font-bold px-4 py-10 md:py-5">
          {navTitle}
        </h3>
        <div className="hidden sm:flex items-center gap-x-2 bg-brand-grey-50 dark:bg-brand-blue-950 px-3 py-1.5 rounded-full border border-brand-grey-400/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-grey-400 dark:text-white/70">
            Booking {bookingStatus}
          </span>
        </div>
        <section
          className="flex items-center gap-x-3 cursor-pointer"
          onClick={() => setDark(!isDark)}
        >
          {children}
          <h3 className="text-xl font-medium">{bgColor} Mode</h3>
        </section>
      </nav>
    </>
  )
}
