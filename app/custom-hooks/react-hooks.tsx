import { useState, useEffect } from "react"
import { useContext } from "react"
import { ThemeContext } from "~/react-contexts/context"
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
