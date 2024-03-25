import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

interface EmailExpiredPageProps {}

const EmailExpiredPage: React.FC<EmailExpiredPageProps> = ({}) => {
  return (
    <main className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full sm:max-w-[450px] flex flex-col gap-4 justify-center items-center">
        <Alert className="bg-red-500/10 border-red-500/50 text-red-700">
          <MailCheck className="size-4" />
          <AlertTitle>Verification link has expired</AlertTitle>
          <AlertDescription className="flex flex-col justify-start gap-2">
            Please request a new verification link.
          </AlertDescription>
        </Alert>
        <Link href="/" className={cn(buttonVariants({variant: "link"}), "self-center")}>
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default EmailExpiredPage;
