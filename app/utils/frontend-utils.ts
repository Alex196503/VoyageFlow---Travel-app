import axios from "axios"
import { redirect, type SetURLSearchParams } from "react-router"
import { api } from "~/axios/axios"

export type Booking = {
  id: number
  user_id: number
  trip_id: number
  total_price: number
  seats_booked: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
  createdAt: string
}

class AccessTokenFrontend {
  // Single global frontend access token value for the entire app.
  private accessToken: string | null = null
  constructor() {}
  setAccessToken(token: string) {
    this.accessToken = token
  }
  getAccessToken() {
    return this.accessToken
  }
}
// One global storage instance used by the frontend to read/write the token.
export const accessTokenStorage = new AccessTokenFrontend()

// Server-side auth gate for protected routes. We inspect the incoming request cookies, require a refreshToken cookie to exist, then call the refresh endpoint with those same cookies attached.
export const requireAuthOnServer = async (request: Request) => {
  const cookieHeaders = request.headers.get("cookie") || ""
  const cookies = Object.fromEntries(
    cookieHeaders.split("; ").map((cookie) => {
      const [key, ...v] = cookie.split("=")
      return [key, v.join("=")]
    })
  )
  if (!cookies["refreshToken"]) {
    throw redirect("/login?token=notFound")
  }
  try {
    await api.post<{
      accessToken: string
      user: {
        id?: number | undefined
        name: string
        email: string
      }
    }>(
      "/auth/refresh",
      {},
      {
        headers: {
          cookie: cookieHeaders
        }
      }
    )
  } catch (error) {
    throw redirect("/login?token=invalid")
  }
}

// Loader helper: redirect authenticated users away from public auth pages, reads `refreshToken` from incoming request cookies and returns a `redirect` to `/` when present.
export const redirectIfAuthenticated = (request: Request) => {
  const cookieHeaders = request.headers.get("cookie") || ""
  const cookies = Object.fromEntries(
    cookieHeaders.split("; ").map((cookie) => {
      const [key, ...v] = cookie.split("=")
      return [key, v.join("=")]
    })
  )
  if (cookies["refreshToken"]) {
    return redirect("/?message=alreadyLoggedIn")
  }
  return null
}

//Function that checks if there are any changes made to the profile form fields. If no changes are detected, it shows an info toast message and prevents the form submission.
export const hasNoProfileChanges = (
  currentUsername: string,
  username: string,
  currentEmail: string,
  email: string,
  currentPassword: string,
  selectedFile: File | null
) => {
  const isUsernameUnhanged = username === currentUsername
  const isEmailUnchanged = currentEmail === email
  const isPasswordEmpty = currentPassword === ""
  const isAvatarUnchanged = selectedFile === null
  if (
    isUsernameUnhanged &&
    isEmailUnchanged &&
    isPasswordEmpty &&
    isAvatarUnchanged
  ) {
    return {
      hasChanges: false,
      shouldStop: true,
      message: "No changes made to the profile!"
    }
  }
  return { hasChanges: true, shouldStop: false }
}

//Updates, adds, or removes a query parameter in the URL search params. If a value is provided, it sets or updates the parameter. If the value is empty, it deletes the parameter from the URL.
export const handleParamChange = (
  key: string,
  value: string,
  setSearchParams: SetURLSearchParams
) => {
  setSearchParams((prev) => {
    if (value) {
      prev.set(key, value)
      prev.set("page", "1")
    } else {
      prev.delete(key)
    }
    return prev
  })
}

//Handler function that sanitizes the value introduced by the user in the price input
export const sanitizePriceValue = (value: string) => {
  if (!value) return ""
  const numericOnly = value.replace(/[^0-9]/g, "")
  if (!numericOnly) return ""
  const num = Number(numericOnly)
  const ABSOLUTE_MAX_PRICE = 10000
  if (num > ABSOLUTE_MAX_PRICE) {
    return ABSOLUTE_MAX_PRICE.toString()
  }
  return num.toString()
}

//Handler function that sanitizes the seats value introduced by the user in the number input
export const sanitizeSeatsValue = (
  value: string,
  available_seats: number
) => {
  if (!value) return "1"
  const numericOnly = value.replace(/[^0-9]/g, "")
  if (!numericOnly) return "1"
  const num = Number(numericOnly)
  const MIN_SEATS = 1
  const MAX_ALLOWED_SEATS = Math.min(available_seats, 10)
  if (num < MIN_SEATS) return MIN_SEATS.toString()
  if (num >= MAX_ALLOWED_SEATS) return MAX_ALLOWED_SEATS.toString()
  return num.toString()
}

//Handler function to calculate the difference in days between end date and start date of the trip
export const calculateDuration = (
  start: string | Date,
  end: string | Date
) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const nights = diffDays > 0 ? diffDays - 1 : 0
  return `${diffDays} Days / ${nights} Nights`
}

//Handler function that returns the name of the country based on its country code using Intl.DisplayNames object browser
export const getCountryName = (countryCode: string) => {
  const regionNames = new Intl.DisplayNames(["en"], {
    type: "region"
  })
  return regionNames.of(countryCode.toUpperCase()) || countryCode
}

//Function that sends the request to the server after the user books the trip
export const bookingTripFetcher = async (
  tripId: string,
  seats: number = 1
) => {
  try {
    let res = await api.post<{
      bookingCreated: Booking
      success: boolean
      message: string
    }>("/bookings", {
      trip_id: tripId,
      seats_booked: seats
    })
    return {
      success: true,
      message: "Booking succesfully created!",
      data: res.data.bookingCreated
    }
  } catch (error) {
    let errorMessage = "An unexpected error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error?.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, message: errorMessage }
  }
}
