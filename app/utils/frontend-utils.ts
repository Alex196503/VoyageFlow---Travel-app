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
