import * as z from "zod"
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
