import crypto from "crypto"
import bcrypt from "bcrypt";

// Interface for token hashing/encryption operations
export interface TokenCrypto {
  hashToken(token: string): string
}

//Interface for generating a token for several operations
export interface TokenGenerator {
  generate(bytes?: number): string
}

// SHA256 implementation of EmailVerificationTokenCrypto
export class SHA256TokenCrypto implements TokenCrypto {
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }
}

//Class useful for implementing the interface and generating the token
export class CryptoRandomTokenGenerator implements TokenGenerator {
  generate(bytes = 32): string {
    return crypto.randomBytes(bytes).toString("hex")
  }
}

// PasswordHasher interface for hashing and comparing passwords
export interface PasswordHasher {
  hash(password: string): Promise<string>
  compare(password: string, hashedPassword: string): Promise<boolean>
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