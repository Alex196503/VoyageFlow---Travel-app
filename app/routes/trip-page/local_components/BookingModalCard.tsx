import type { UserBookingRow } from "~/types/types"

export const BookingModalCard = ({
  booking
}: {
  booking: UserBookingRow
}) => {
  return (
    <article
      key={booking.booking_id}
      className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 transition-all hover:shadow-md"
    >
      <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-slate-700">
        {booking.cover_image_url ? (
          <img
            src={booking.cover_image_url}
            alt={booking.trip_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 w-full flex flex-col justify-between gap-2">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {booking.trip_title}
          </h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
              booking.status === "CONFIRMED"
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : booking.status === "PENDING"
                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
          >
            {booking.status}
          </span>
        </section>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
          <section>
            <span className="span-modal-booking">Seats booked: </span>
            <span className="font-medium">
              {booking.seats_booked}
            </span>
          </section>
          <div>
            <span className="span-modal-booking">Total: </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              €{booking.total_price}
            </span>
          </div>
        </div>

        <section className="text-xs flex justify-between items-center pt-1 border-t border-gray-200/50 dark:border-white/5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Booked on:{" "}
            {new Date(booking.createdAt).toLocaleDateString()}
          </p>
          {booking.status === "PENDING" && (
            <button className="flex items-center cursor-pointer justify-center gap-2 px-6 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-95 transition-all duration-200">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                ></path>
              </svg>
              Pay Now
            </button>
          )}
        </section>
      </div>
    </article>
  )
}
