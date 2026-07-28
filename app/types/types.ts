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
