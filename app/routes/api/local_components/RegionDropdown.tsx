export default function RegionDropdown({
  label,
  id,
  options,
  value,
  onChange
}: {
  label: string
  id: string
  options: string[]
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement, Element>) => void
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="w-full px-6 py-4 rounded-md shadow-sm bg-white dark:bg-brand-blue-900 text-brand-grey-950 dark:text-white focus:outline-none appearance-none cursor-pointer transition-colors"
        value={value}
        onChange={onChange}
      >
        {options.map((option, index) => {
          return (
            <option
              key={option}
              value={index === 0 ? "" : option}
              disabled={index === 0}
            >
              {option}
            </option>
          )
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6 text-brand-grey-950 dark:text-white">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </>
  )
}
