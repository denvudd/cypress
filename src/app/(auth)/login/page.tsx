"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginUser } from "@/queries/auth";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  LoginValidator,
  LoginValidatorSchema,
} from "@/lib/validators/login.validator";

import CypressLogo from "../../../../public/cypresslogo.svg";

function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string>("");

  const form = useForm<LoginValidatorSchema>({
    mode: "onChange",
    resolver: zodResolver(LoginValidator),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting || form.formState.isLoading;

  const onSubmit: SubmitHandler<LoginValidatorSchema> = async (values) => {
    const { error } = await loginUser(values);

    if (error) {
      form.reset();
      setSubmitError(error.message);

      return undefined;
    }

    router.replace("/dashboard");
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link href="/" className="w-full flex justify-left items-center">
          <Image src={CypressLogo} alt="Cypress Logo" width={50} height={50} />
          <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
            cypress.
          </span>
        </Link>
        <FormDescription className="text-foreground/60">
          An All-In-One Collaboration and Productivity
        </FormDescription>
        <FormField
          disabled={isLoading}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="email" placeholder="Email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isLoading}
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="password" placeholder="Password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="w-full py-5"
          disabled={isLoading}
          isLoading={isLoading}
        >
          Login
        </Button>
        <span className="text-sm">
          Dont have an account?{" "}
          <Link href="/sign-up" className="text-primary">
            Sign Up
          </Link>
        </span>
      </form>
    </Form>
  );
}

export default LoginPage;
