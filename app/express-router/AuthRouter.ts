import {
  type NextFunction,
  type Request,
  type Response
} from "express"
import jwt from "jsonwebtoken"
import {
  AuthService,
  BadRequestError,
  BCryptHasher,
  JwtTokenService
} from "../server/auth/AuthService"
import type { RegisterResponse } from "../types/types"
import express from "express"
import { prisma } from "../../prisma/prisma"
import { authentificationMiddleware } from "~/middleware/authMiddleware"
import {
  LoginSchema,
  RegisterSchema
} from "~/utils/validation/zod-validation"

export const AuthRouter = express.Router()
const bcryptHasher = new BCryptHasher()
const jwtTokenService = new JwtTokenService()
const authService = new AuthService(
  prisma,
  bcryptHasher,
  jwtTokenService
)

AuthRouter.post(
  "/register",
  async (
    req: Request<
      {},
      {},
      {
        name: string
        email: string
        password: string
        confirmPassword: string
      }
    >,
    res: Response<RegisterResponse>,
    next: NextFunction
  ) => {
    const { name, email, password, confirmPassword } = req.body || {}
    try {
      const resultRegister = RegisterSchema.safeParse(req.body)
      if (!resultRegister.success) {
        return res.status(400).json({
          success: false,
          message: resultRegister.error.format()
        })
      }
      const newUser = await authService.registerUser(
        name,
        email,
        password
      )
      res.cookie("refreshToken", newUser.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
      const { refreshToken, ...userWithoutSensitiveDAta } = newUser
      return res.status(201).json({
        success: true,
        message: "User registered successfully!",
        user: userWithoutSensitiveDAta
      })
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({
          message: err.message,
          success: false
        })
      }
      return next(err)
    }
  }
)

AuthRouter.post(
  "/login",
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response<RegisterResponse & { accessToken?: string }>,
    next: NextFunction
  ) => {
    let { email, password } = req.body || {}

    try {
      const resultLogin = LoginSchema.safeParse(req.body)
      if (!resultLogin.success) {
        return res.status(400).json({
          success: false,
          message: resultLogin.error.format()
        })
      }
      const { user, refreshToken } = await authService.loginUser(
        email,
        password
      )
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
      return res.status(200).json({
        message: "User logged in successfully!",
        success: true,
        user
      })
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(401).json({
          message: err.message,
          success: false
        })
      }
      return next(err)
    }
  }
)

AuthRouter.post(
  "/logout",
  async (
    req: Request<{}, {}, { id: string }>,
    res: Response<RegisterResponse>,
    next: NextFunction
  ) => {
    try {
      const { id } = req.body
      console.log(id)
      if (id) {
        await prisma.user.update({
          where: { id: Number(id) },
          data: {
            refresh_token: null,
            refresh_token_expires_at: null
          }
        })
      }
    } catch (err) {
      console.error(`Error while updating our database ${err}`)
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })
    return res
      .status(200)
      .json({ message: "Logged out!", success: true })
  }
)

AuthRouter.post(
  "/refresh",
  async (
    req: Request,
    res: Response<RegisterResponse & { accessToken?: string }>,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies?.refreshToken as string
      if (!token) {
        return res.status(401).json({
          message: "No refresh token provided",
          success: false
        })
      }
      const result = await authService.refreshToken(token)
      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        }
      })
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        success: false
      })
    }
  }
)
