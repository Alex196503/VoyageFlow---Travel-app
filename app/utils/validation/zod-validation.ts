import * as z from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]

export const RegisterSchema = z
  .object({
    name: z
      .string("The username is required")
      .min(3, "The username must be at least 3 characters long")
      .max(15, "The username cannot exceed 15 characters"),
    email: z
      .string("The email is required")
      .email("Invalid email address")
      .min(10, "Email must be at least 10 characters long"),
    password: z
      .string("The password is required")
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z.string("Confirm password is required")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export const FileValidationSchema = z.object({
  originalname: z.string(),
  filename: z.string(),
  mimetype: z
    .string()
    .refine(
      (type) => ACCEPTED_IMAGE_TYPES.includes(type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  size: z.number().max(MAX_FILE_SIZE, "Max file size is 5MB.")
})

export const LoginSchema = z.object({
  email: z
    .string("The email is required")
    .email("Invalid email address")
    .min(10, "Email must be at least 10 characters long"),
  password: z
    .string("The password is required")
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
      "Password must contain at least one letter and one number"
    )
})

export const ResetPasswordSchema = z
  .object({
    password: z
      .string({ message: "The password is required" })
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z.string({
      message: "Confirm password is required"
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
