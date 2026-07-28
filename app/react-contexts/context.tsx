import { createContext } from "react"
import { type ThemeContextProps } from "~/types/types"
//Global context to manage the theme of the app to avoid prop drilling through multiple components
export const ThemeContext = createContext<ThemeContextProps | null>(
  null
)
