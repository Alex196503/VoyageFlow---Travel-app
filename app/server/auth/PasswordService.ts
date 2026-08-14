import { type PrismaClient } from "../../../generated/prisma/client"
import type {
  PasswordHasher,
  TokenCrypto,
  TokenGenerator
} from "./security-helpers"
import { BadRequestError } from "./custom-errors"

export class PasswordService {
  private prisma: PrismaClient
  private tokenCrypto: TokenCrypto
  private tokenGenerator: TokenGenerator
  private passwordHasher: PasswordHasher
  constructor(
    prisma: PrismaClient,
    tokenCrypto: TokenCrypto,
    tokenGenerator: TokenGenerator,
    passwordHasher: PasswordHasher
  ) {
    this.prisma = prisma
    this.tokenCrypto = tokenCrypto
    this.tokenGenerator = tokenGenerator
    this.passwordHasher = passwordHasher
  }
  async forgotPassword(email: string) {
    const userFound = await this.prisma.user.findUnique({
      where: { email }
    })
    if (!userFound) {
      return null
    }
    const passwordResetToken = this.tokenGenerator.generate(32)
    const hashedResetToken = this.tokenCrypto.hashToken(
      passwordResetToken
    )
    await this.prisma.user.update({
      where: { id: userFound.id },
      data: {
        reset_token: hashedResetToken,
        reset_token_expires_at: new Date(
          Date.now() + 1 * 60 * 60 * 1000
        )
      }
    })
    return {
      emailFound: userFound.email,
      passwordResetToken
    }
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = this.tokenCrypto.hashToken(token)
    const existingUser = await this.prisma.user.findFirst({
      where: { reset_token: hashedToken }
    })
    if (!existingUser) {
      throw new BadRequestError(
        "The reset link is invalid or has expired. Please request a new one."
      )
    }
    if (
      existingUser.reset_token_expires_at &&
      existingUser.reset_token_expires_at < new Date()
    ) {
      throw new BadRequestError(
        "The reset link is invalid or has expired. Please request a new one."
      )
    }
    const newHashedPassword = await this.passwordHasher.hash(password)
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: newHashedPassword,
        reset_token: null,
        reset_token_expires_at: null
      }
    })
    return { success: true }
  }
}
