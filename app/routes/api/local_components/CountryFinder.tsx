import type { ReactNode } from "react"

export default function CountryFinder({
  children,
  label,
  id,
  value,
  onChange
}: {
  children: ReactNode
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement, Element>) => void
}) {
  return (
    <>
      <div className="relative w-full md:w-96">
        <span className="absolute inset-y-0 text-2xl left-0 flex items-center pl-6 pointer-events-none text-brand-grey-400">
          {children}
        </span>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          type={id}
          id={id}
          placeholder={label}
          onChange={onChange}
          className="w-full pl-14 pr-6 py-4 rounded-md shadow-sm bg-white dark:bg-brand-blue-900 text-brand-grey-950 dark:text-white placeholder-brand-grey-400 dark:placeholder-white/60 focus:outline-none transition-colors"
          value={value}
        />
      </div>
    </>
  )
}
