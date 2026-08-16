import { useState, useEffect } from "react"
import { useContext } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { api } from "~/axios/axios"
import { type RegisterResponse } from "~/types/types"
import { AuthContext, ThemeContext } from "~/react-contexts/context"
import type { z, ZodFormattedError, ZodTypeAny } from "zod"
import { toast } from "react-toastify"
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
    if (formData.has("avatar")) {
      const avatarFile = formData.get("avatar") as File
      if (!avatarFile || avatarFile.size === 0) {
        setError({
          _errors: [],
          avatar: { _errors: ["Profile picture is required"] }
        })
        setLoading(false)
        return
      }
    }
    try {
      const dataToSend = url.includes("/login") ? payload : formData
      const res = await api.post<
        RegisterResponse & { accessToken: string }
      >(url, dataToSend, {})
      setAccessToken(res.data.accessToken as string)
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

//Custom hook that provides a simple second-based countdown state and a formatted `MM:SS` string.
export function useCountdown(initialTime = 0) {
  const [countdown, setCountdown] = useState(initialTime)
  useEffect(() => {
    if (countdown <= 0) return
    let timerId = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [countdown])
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  return {
    countdown,
    setCountdown,
    formattedTime,
    isCounting: countdown > 0
  }
}


//Custom hook to handle React Router fetcher responses, automatically triggering toast notifications or form error updates.
export function useFormToast<
  T extends {
    success: boolean
    message?: string
    errors?: Record<string, string[]> | undefined
  }
>(
  fetcherData: T | undefined,
  setErrors?: (errors: Record<string, string[] | undefined>) => void
) {
  useEffect(() => {
    if (!fetcherData) return
    if (fetcherData.success) {
      toast.success(fetcherData.message || "Operation successful!")
    } else {
      if (fetcherData.errors && setErrors) {
        setErrors(fetcherData?.errors)
      } else if (fetcherData.message) {
        toast.error(fetcherData.message)
      }
    }
  }, [fetcherData])
}
