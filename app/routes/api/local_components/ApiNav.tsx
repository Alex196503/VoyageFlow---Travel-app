import axios from "axios"
import type { ReactNode } from "react"
import { useNavigate } from "react-router"
import { api } from "~/axios/axios"
import { useAuth } from "~/custom-hooks/react-hooks"
import type { RegisterResponse } from "~/types/types"

export default function ApiNav({
  navTitle,
  bookingStatus,
  children,
  bgColor,
  isDark,
  setDark,
  user
}: {
  navTitle: string
  bookingStatus: string
  children: ReactNode
  isDark: boolean
  bgColor: string
  setDark: React.Dispatch<React.SetStateAction<boolean>>
  user?:
    | {
        id?: number | undefined
        name?: string | undefined
      }
    | null
    | undefined
}) {
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuth()
  const logOutUser = async () => {
    try {
      let res = await api.post<{ success: boolean; message: string }>(
        "/auth/logout",
        { id: user?.id },
        { withCredentials: true }
      )
      if (res.data.success) {
        setUser(null)
        setAccessToken("")
        return navigate("/login")
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Logout failed from server:",
          error.response?.data?.message || error.message
        )
      } else {
        console.error("An unexpected error occurred during logout")
      }
      setUser(null)
      setAccessToken("")
      navigate("/login")
    }
  }
  return (
    <>
      <nav className="w-full flex flex-col md:flex-row justify-between items-center gap-4 px-6 md:px-16 py-4 bg-white dark:bg-brand-blue-900 transition-colors border-b border-brand-grey-400/20 dark:border-white/10">
        <div className="w-full md:w-auto flex justify-between items-center">
          <h3 className="text-2xl font-bold py-2 md:py-5">
            {navTitle}
          </h3>
          <div className="flex sm:hidden items-center gap-x-2 bg-brand-grey-50 dark:bg-brand-blue-950 px-3 py-1.5 rounded-full border border-brand-grey-400/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-grey-400 dark:text-white/70">
              {bookingStatus}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-x-2 bg-brand-grey-50 dark:bg-brand-blue-950 px-3 py-1.5 rounded-full border border-brand-grey-400/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-grey-400 dark:text-white/70">
            Booking {bookingStatus}
          </span>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-brand-grey-400/10 dark:border-white/10">
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2">
            {user ? (
              <section className="w-full sm:w-auto flex items-center gap-3">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                    alt="User"
                    className="w-7 h-7 rounded-full object-cover border border-indigo-500"
                  />
                  <span className="text-sm font-medium text-white">
                    {user.name || "Alex"}
                  </span>
                </a>
                <button
                  onClick={logOutUser}
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-[0.98]"
                >
                  <span>Logout</span>
                </button>
              </section>
            ) : (
              <div className="w-full sm:w-auto grid grid-cols-2 gap-2">
                <a
                  href="/login"
                  className={`text-center text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${
                    isDark
                      ? "text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="text-center text-sm font-medium px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  Register
                </a>
              </div>
            )}
          </div>
          <section
            className="w-full sm:w-auto flex items-center justify-center gap-x-3 cursor-pointer py-2 sm:py-0 select-none"
            onClick={() => setDark(!isDark)}
          >
            {children}
            <h3 className="text-base sm:text-xl font-medium">
              {bgColor} Mode
            </h3>
          </section>
        </div>
      </nav>
    </>
  )
}
