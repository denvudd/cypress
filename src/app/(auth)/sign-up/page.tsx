"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";

import { signUpUser } from "@/queries/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  SignUpValidator,
  SignUpValidatorSchema,
} from "@/lib/validators/sign-up.validator";
import { cn } from "@/lib/utils";

import CypressLogo from "../../../../public/cypresslogo.svg";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SignUpPageProps {}

const SignUpPage: React.FC<SignUpPageProps> = ({}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submitError, setSubmitError] = React.useState<string>("");
  const [confirmation, setConfirmation] = React.useState<boolean>(false);

  const exchangeError: string | null = React.useMemo(() => {
    if (!searchParams) return null;

    return searchParams.get("error_description");
  }, [searchParams]);

  const form = useForm<SignUpValidatorSchema>({
    mode: "onChange",
    resolver: zodResolver(SignUpValidator),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<SignUpValidatorSchema> = async (values) => {
    const { error } = await signUpUser(values);

    if (error) {
      setSubmitError(error.message);
      form.reset();

      return undefined;
    }

    setConfirmation(true);
  };

  const isLoading = form.formState.isSubmitting || form.formState.isLoading;

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] flex flex-col gap-4"
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
        {!confirmation && !exchangeError && (
          <>
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

            <FormField
              disabled={isLoading}
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full py-5"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Create account
            </Button>
          </>
        )}

        {submitError && <FormMessage>{submitError}</FormMessage>}
        <span className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </span>
        {(confirmation || exchangeError) && (
          <Alert
            className={cn("bg-primary", {
              "bg-red-500/10 border-red-500/50 text-red-700": exchangeError,
            })}
          >
            {!exchangeError && <MailCheck className="size-4" />}
            <AlertTitle>
              {exchangeError ? "Link expired" : "Check your email."}
            </AlertTitle>
            <AlertDescription>
              {exchangeError ||
                "An email confirmation has been sent to your email inbox."}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
};

export default SignUpPage;
