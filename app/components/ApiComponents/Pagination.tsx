export default function PaginationComponent({
  currentPage,
  setCurrentPage,
  numberOfPages
}: {
  currentPage: number
  setCurrentPage: (value: React.SetStateAction<number>) => void
  numberOfPages: number
}) {
  return (
    <div className="inline-flex items-center -space-x-px rounded-md shadow-sm">
      <button
        type="button"
        disabled={currentPage <= 1}
        className="btn-control"
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>
      {currentPage > 2 && (
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          className="bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700 inline-flex items-center px-4 py-2 text-sm font-semibold cursor-pointer"
        >
          1
        </button>
      )}
      {currentPage > 3 && <span className="btn-expanding">...</span>}
      {Array.from({ length: numberOfPages }, (_, i) => i + 1)
        .filter(
          (page) => page >= currentPage - 1 && page <= currentPage + 1
        )
        .map((pageNumber) => {
          const isActive = currentPage === pageNumber
          return (
            <button
              type="button"
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                isActive
                  ? "z-10 bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100"
                  : "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700 cursor-pointer"
              }`}
            >
              {pageNumber}
            </button>
          )
        })}
      {currentPage < numberOfPages - 2 && (
        <span className="btn-expanding">...</span>
      )}
      {currentPage < numberOfPages - 1 && (
        <button
          type="button"
          onClick={() => setCurrentPage(numberOfPages)}
          className="bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700 inline-flex items-center px-4 py-2 text-sm font-semibold cursor-pointer"
        >
          {numberOfPages}
        </button>
      )}
      <button
        type="button"
        className="btn-control"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === numberOfPages}
      >
        Next
      </button>
    </div>
  )
}
