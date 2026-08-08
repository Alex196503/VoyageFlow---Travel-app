import { useState, useEffect } from "react"
import { useContext } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { api } from "~/axios/axios"
import { type RegisterResponse } from "~/types/types"
import { AuthContext, ThemeContext } from "~/react-contexts/context"
import type { z, ZodFormattedError, ZodTypeAny } from "zod"
// Custom hook to debounce a fast-changing value. It delays updating the returned value until the user stops typing for the specified delay.
export function useDebouncer(value: string, delay: number) {
  const [debounceValue, setDebounceValue] = useState(value)
  useEffect(() => {
    let timeout = setTimeout(() => {
      setDebounceValue(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])
  return debounceValue
}

// Custom hook to perform an authentification request to the server, that can be used in our register or login page
export function useAuthSubmit<AuthSchema extends ZodTypeAny>(
  url: string,
  redirectTo: string,
  schema: AuthSchema
) {
  const { setAccessToken, setUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<
    string | ZodFormattedError<any> | null
  >(null)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    const result = schema.safeParse(payload)
    if (!result.success) {
      setError(result?.error.format())
      setLoading(false)
      return
    }
    try {
      const res = await api.post<
        RegisterResponse & { accessToken: string }
      >(url, payload)
      setAccessToken(res.data?.user?.accessToken as string)
      setUser(res.data.user)
      navigate(redirectTo)
    } catch (err: unknown) {
      if (axios.isAxiosError<Omit<RegisterResponse, "user">>(err)) {
        setError(
          err.response?.data?.message ||
            "Communication error with the server!"
        )
      } else {
        setError("An unexpected error ocurred!" + err)
      }
    } finally {
      setLoading(false)
    }
  }
  return { error, loading, handleSubmit }
}

// Custom hook to safely consume the reset context.
export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error(
      "Reset context does not exist or was not created properly!"
    )
  }
  return context
}

//Custom hook to consume the authContext, that stores our short-lived access token.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("Auth context does not exist in your app!")
  }
  return context
}
