import { type PrismaClient } from "../../../generated/prisma/client"
import { UnauthorizedError, BadRequestError } from "./custom-errors"
import type { TokenCrypto, TokenGenerator } from "./security-helpers"

export class VerificationService {
  private prisma: PrismaClient
  private tokenCryptoHasher: TokenCrypto
  private tokenGenerator: TokenGenerator
  constructor(
    prisma: PrismaClient,
    tokenCryptoGenerator: TokenCrypto,
    tokenGenerator: TokenGenerator
  ) {
    this.prisma = prisma
    this.tokenCryptoHasher = tokenCryptoGenerator
    this.tokenGenerator = tokenGenerator
  }

  // Verify a plaintext email verification token: hash, find user, check expiry, mark verified
  validateEmailVerification = async (token: string) => {
    let hashedToken = this.tokenCryptoHasher.hashToken(token)
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

  // Generate and store a new verification token for a user who requested resend
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
    const newVerificationToken = this.tokenGenerator.generate(32)
    const hashedToken = this.tokenCryptoHasher.hashToken(
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
