import z from "zod";

export const LoginValidator = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginValidatorSchema = z.infer<typeof LoginValidator>;
