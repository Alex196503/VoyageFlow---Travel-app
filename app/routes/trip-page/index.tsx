import { api } from "~/axios/axios"
import type { Route } from "./+types"
import type { TripsResponse } from "~/types/types"
import axios from "axios"
import { useLoaderData, useSearchParams } from "react-router"
import ApiNav from "../api/local_components/ApiNav"
import { useAuth, useThemeContext } from "~/custom-hooks/react-hooks"
import { IoMoon, IoSearch, IoSunny } from "react-icons/io5"
import { TripCard } from "./local_components/TripCard"
import { GeneralDropdown } from "./local_components/GeneralDropdown"
import { getMeta } from "~/helpers/helpers"
import {
  handleParamChange,
  requireAuthOnServer
} from "~/utils/frontend-utils"
import { CountryCodeSearcher } from "./local_components/CountryCodeSearcher"
import { RangeInput } from "./local_components/RangeInput"

export const meta = () =>
  getMeta(
    "Trips page",
    "Check some information about our existing trips"
  )

export async function loader({ params, request }: Route.LoaderArgs) {
  requireAuthOnServer(request)
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get("category") || ""
    const search = url.searchParams.get("search") || ""
    const minPrice = url.searchParams.get("minPrice") || ""
    const maxPrice = url.searchParams.get("maxPrice") || ""
    const page = url.searchParams.get("page") || ""
    const response = await api.get<{
      formattedTrips: TripsResponse
      totalPages: number
    }>("/trips/", {
      params: {
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
        ...(minPrice ? { minPrice } : {}),
        ...(maxPrice ? { maxPrice } : {}),
        ...(page ? { page } : {})
      }
    })
    return {
      trips: response.data.formattedTrips,
      totalPages: response.data.totalPages
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message =
        error.response?.data?.message || "Failed to fetch trips"
      throw new Response(message, { status })
    }
    throw new Response("An unexpected error occurred", {
      status: 500
    })
  }
}
export default function TripPage() {
  let data = useLoaderData<typeof loader>()
  const { isDark, setDark } = useThemeContext()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentSearch = searchParams.get("search") || ""
  const currentMinPrice = searchParams.get("minPrice") || ""
  const currentMaxPrice = searchParams.get("maxPrice") || ""
  const page = Number(searchParams.get("page")) || 1

  const goToPage = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", newPage.toString())
      return prev
    })
  }
  return (
    <>
      <ApiNav
        navTitle="Where in the world?"
        bgColor={isDark ? "Dark" : "Light"}
        setDark={setDark}
        isDark={isDark}
        user={user}
      >
        {isDark ? <IoMoon /> : <IoSunny />}
      </ApiNav>
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="flex flex-col md:flex-row justify-center w-full items-center gap-y-4 md:gap-y-1 md:justify-between">
            <div className="flex flex-col gap-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Explore Our Available Trips
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Find your next unforgettable adventure around the
                world.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-10 w-full md:w-auto">
              <div className="relative inline-block w-full md:w-48">
                <GeneralDropdown
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <CountryCodeSearcher
                currentSearch={currentSearch}
                handleSearchChange={(e) =>
                  handleParamChange(
                    "search",
                    e.target.value,
                    setSearchParams
                  )
                }
              />
              <div className="flex items-center gap-2 w-full justify-center sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
                <span className="text-xs text-slate-400 font-medium">
                  Price (in $):
                </span>
                <RangeInput
                  min={0}
                  max={10000}
                  value={currentMinPrice}
                  setSearchParams={setSearchParams}
                  placeholder="min"
                  name="minPrice"
                />
                <span className="text-slate-400">
                  <strong>-</strong>
                </span>
                <RangeInput
                  min={0}
                  max={10000}
                  value={currentMaxPrice}
                  setSearchParams={setSearchParams}
                  placeholder="max"
                  name="maxPrice"
                />
              </div>
            </div>
            {(searchParams.get("category") ||
              searchParams.get("search") ||
              searchParams.get("minPrice") ||
              searchParams.get("maxPrice")) && (
              <button
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium self-center md:self-auto cursor-pointer"
                onClick={() => setSearchParams({})}
              >
                Clear filters
              </button>
            )}
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {data.trips.map((trip) => {
              return (
                <TripCard
                  title={trip.title}
                  description={trip.description}
                  start_date={trip.start_date}
                  category={trip.category}
                  country_code={trip.country_code}
                  available_seats={trip.available_seats}
                  price={trip.price}
                  end_date={trip.end_date}
                  id={trip.id}
                  total_seats={trip.total_seats}
                  key={trip.title}
                  images={trip.images}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-2 justify-center mt-8">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="btn-pagination"
            >
              ←
            </button>
            {Array.from(
              { length: data.totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${
                  p === page
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === data.totalPages}
              className="btn-pagination"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
