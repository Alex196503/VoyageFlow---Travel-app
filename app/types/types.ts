import type { ZodFormattedError } from "zod"
import type { RegisterSchema } from "~/utils/validation/zod-validation"

export interface RawCountry {
  name: string
  nativeName?: string
  population?: number
  region?: string
  subregion?: string
  capital?: string
  flag: string
  alpha3Code?: string
  topLevelDomain?: string[]
  currencies?: Currency[]
  languages?: { name: string }[]
  borders?: string[]
}

export interface Currency {
  name: string
  symbol: string
}

export interface ThemeContextProps {
  isDark: boolean
  setDark: React.Dispatch<React.SetStateAction<boolean>>
}

export type InputProps = {
  label: string
  fieldType: string
  placeholder?: string
  minLength?: number
  maxLength?: number
  defaultValue?: string
  existingImageUrl?: string
}

export type InputFile = InputProps & {
  accept: string
}

export interface UserRegisterProps {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  message: string | ZodFormattedError<typeof RegisterSchema>
  accessToken?: string
  user?: {
    id?: number | undefined
    name: string
    email: string
    avatar?: string
    isVerified?: boolean
  }
}

export interface AuthenticatedUser {
  id: string
}

export interface AuthContextProps {
  accessToken: string | null
  setAccessToken: (token: string) => void
  user?: {
    id?: number
    name?: string
    avatar?: string
    email: string
    isVerified?: boolean
  } | null
  setUser: (user: AuthContextProps["user"]) => void
}

export type ExpressErrorResponse = {
  success?: boolean
  message?: string
  errors?: {
    password?: string
    confirmPassword?: string
  }
}

export type ProfileRouteResponse = {
  success: boolean
  message: string
  user?: {
    name: string
    email: string
    avatar: string
  }
  errors?: {
    username?: string[]
    email?: string[]
    password?: string[]
  }
}

export type UpdateProfileInput = {
  username?: string
  email?: string
  password?: string
  avatarFile?: string
}
