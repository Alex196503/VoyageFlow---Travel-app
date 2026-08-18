import { IoSearch } from "react-icons/io5"
export const CountryCodeSearcher = ({currentSearch, handleSearchChange}: {currentSearch : string, handleSearchChange: (e: React.ChangeEvent<HTMLInputElement, Element>) => void}) => {
  return (
    <section className="relative inline-block w-full sm:w-48">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <IoSearch className="w-4 h-4" />
      </span>
      <input
        type="text"
        value={currentSearch}
        onChange={handleSearchChange}
        placeholder="Search by country code..."
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-medium rounded-xl pl-10 pr-2 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
      />
    </section>
  )
}
