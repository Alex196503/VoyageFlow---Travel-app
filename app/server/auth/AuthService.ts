import { type PrismaClient } from "../../../generated/prisma/client"
import bcrypt from "bcrypt"
import jwt, { type SignOptions } from "jsonwebtoken"
import process from "process"
import crypto from "crypto"

// Error class for handling bad requests
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BadRequestError"
  }
}

// Error class for handling Unauthorized requests
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnauthorizedError"
  }
}

// PasswordHasher interface for hashing and comparing passwords
interface PasswordHasher {
  hash(password: string): Promise<string>
  compare(password: string, hashedPassword: string): Promise<boolean>
}

// Interface for email verification token hashing/encryption operations
interface EmailVerificationTokenCrypto {
  hashToken(token: string): string
}

// SHA256 implementation of EmailVerificationTokenCrypto
export class SHA256EmailVerificationTokenCrypto implements EmailVerificationTokenCrypto {
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }
}

//Interface for generating access and refresh tokens
interface TokenService {
  generateToken(
    userId: string,
    expiresIn: SignOptions["expiresIn"]
  ): string
  verifyToken(token: string): { id: string }
}

//Interface for generating a token for email verification from stratch
interface EmailVerificationTokenGenerator {
  generate(bytes?: number): string
}

//Class useful for implementing the interface and generating the token
export class CryptoRandomTokenGenerator implements EmailVerificationTokenGenerator {
  generate(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex")
  }
}

//Class useful for generating the token using jwt library
export class JwtTokenService implements TokenService {
  generateToken(userId: string, expiresIn: SignOptions["expiresIn"]) {
    return jwt.sign(
      { id: userId },
      process.env.SECRET_KEY || "secret_key",
      {
        expiresIn,
        algorithm: "HS256"
      }
    )
  }
  verifyToken(token: string): { id: string } {
    return jwt.verify(
      token,
      process.env.SECRET_KEY || "secret_key"
    ) as { id: string }
  }
}

// BCryptHasher class implementing the PasswordHasher interface using bcrypt
export class BCryptHasher implements PasswordHasher {
  private readonly saltRounds = 10
  async hash(password: string) {
    return await bcrypt.hash(password, this.saltRounds)
  }
  async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
  }
}

// AuthService class for handling user registration and authentication
export class AuthService {
  private prisma: PrismaClient
  private hasher: PasswordHasher
  private tokenService: TokenService
  private emailVerificationCrypting: EmailVerificationTokenCrypto
  private emailVerificationTokenGenerator: EmailVerificationTokenGenerator
  constructor(
    prisma: PrismaClient,
    hasher: PasswordHasher,
    tokenService: TokenService,
    emailVerificationCrypting: EmailVerificationTokenCrypto,
    emailVerificationTokenGenerator: EmailVerificationTokenGenerator
  ) {
    this.prisma = prisma
    this.hasher = hasher
    this.tokenService = tokenService
    this.emailVerificationCrypting = emailVerificationCrypting
    this.emailVerificationTokenGenerator =
      emailVerificationTokenGenerator
  }
  registerUser = async (
    name: string,
    email: string,
    password: string,
    avatar: string,
    emailVerificationToken: string
  ) => {
    let existingUser = await this.prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      throw new BadRequestError("User already exists")
    }
    const saltedPassword = await this.hasher.hash(password)
    let hashedVerifToken = this.emailVerificationCrypting.hashToken(
      emailVerificationToken
    )

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: saltedPassword,
        avatar_url: avatar,
        email_verification_token: hashedVerifToken,
        email_verification_token_expires_at: new Date(
          Date.now() + 90 * 60 * 1000
        )
      }
    })
    let accessToken = this.tokenService.generateToken(
      newUser.id.toString(),
      "15m"
    )
    let refreshToken = this.tokenService.generateToken(
      newUser.id.toString(),
      "30d"
    )
    const refreshTokenHashed = await this.hasher.hash(refreshToken)
    await this.prisma.user.update({
      where: { id: newUser.id },
      data: {
        refresh_token: refreshTokenHashed,
        refresh_token_expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        )
      }
    })
    return {
      name: newUser.name,
      email: newUser.email,
      accessToken,
      refreshToken
    }
  }

  loginUser = async (email: string, password: string) => {
    const userFound = await this.prisma.user.findUnique({
      where: { email },
      select: {
        password: true,
        name: true,
        email: true,
        id: true
      }
    })
    if (!userFound) {
      throw new BadRequestError("Invalid email or password!")
    }
    const result1 = await this.hasher.compare(
      password,
      userFound?.password
    )
    if (!result1) {
      throw new BadRequestError("Invalid email or password!")
    }
    let accessToken = this.tokenService.generateToken(
      userFound?.id.toString(),
      "15m"
    )
    let refreshToken = this.tokenService.generateToken(
      userFound.id.toString(),
      "30d"
    )
    const refreshTokenHashed = await this.hasher.hash(refreshToken)
    await this.prisma.user.update({
      where: { id: userFound.id },
      data: {
        refresh_token: refreshTokenHashed,
        refresh_token_expires_at: new Date(
          Date.now() + +30 * 24 * 60 * 60 * 1000
        )
      }
    })
    return {
      user: {
        id: userFound.id,
        email: userFound.email,
        name: userFound.name,
        accessToken
      },
      refreshToken
    }
  }

  refreshToken = async (token: string) => {
    const decoded = this.tokenService.verifyToken(token)
    const user = await this.prisma.user.findUnique({
      where: { id: Number(decoded.id) }
    })
    if (!user) {
      throw new BadRequestError("User not found")
    }
    const newAccessToken = this.tokenService.generateToken(
      user.id.toString(),
      "15m"
    )
    return {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url,
        isVerified: user.is_verified
      }
    }
  }

  validateEmailVerification = async (token: string) => {
    let hashedToken = this.emailVerificationCrypting.hashToken(token)
    let existingUser = await this.prisma.user.findFirst({
      where: { email_verification_token: hashedToken }
    })
    if (!existingUser) {
      throw new UnauthorizedError("User not found")
    }
    let existingExpirationPeriod =
      existingUser.email_verification_token_expires_at
    if (
      existingExpirationPeriod &&
      existingExpirationPeriod < new Date()
    ) {
      throw new UnauthorizedError("Link expired!")
    }
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        is_verified: true,
        email_verification_token: null,
        email_verification_token_expires_at: null
      }
    })
    return { message: "Email verified successfully!", success: true }
  }

  validateEmailResendVerification = async (idUser: string) => {
    const userFound = await this.prisma.user.findUnique({
      where: { id: Number(idUser) }
    })
    if (!userFound) {
      throw new BadRequestError(
        "You are not authorized to perform this operation!"
      )
    }
    if (userFound.is_verified) {
      throw new BadRequestError("Email is already verified!")
    }
    const newVerificationToken =
      this.emailVerificationTokenGenerator.generate(32)
    const hashedToken = this.emailVerificationCrypting.hashToken(
      newVerificationToken
    )
    await this.prisma.user.update({
      where: { id: userFound.id },
      data: {
        email_verification_token: hashedToken,
        email_verification_token_expires_at: new Date(
          Date.now() + 90 * 60 * 1000
        )
      }
    })
    return {
      email: userFound.email,
      newVerificationToken
    }
  }
}
