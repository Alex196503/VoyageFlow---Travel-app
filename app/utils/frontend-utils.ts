import { redirect } from "react-router"
import { api } from "~/axios/axios"

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
