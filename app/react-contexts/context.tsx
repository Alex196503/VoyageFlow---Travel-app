import { createContext, useState } from "react"
import {
  type AuthContextProps,
  type ThemeContextProps
} from "~/types/types"
//Global context to manage the theme of the app to avoid prop drilling through multiple components
export const ThemeContext = createContext<ThemeContextProps | null>(
  null
)

// Creates the authentication context with an initial undefined value
export const AuthContext = createContext<
  AuthContextProps | undefined
>(undefined)
