import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";

import ThemeProvider from "@/lib/providers/theme.provider";
import AppStateProvider from "@/lib/providers/app-state.provider";
import { SocketProvider } from "@/lib/providers/socket.provider";
import { SupabaseUserProvider } from "@/lib/providers/supabase-user.provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen h-full antialiased bg-background layout-scrollbar-obtrusive text-render",
          inter.className,
          inter.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SupabaseUserProvider>
            <AppStateProvider>
              <SocketProvider>
                <TooltipProvider delayDuration={300}>
                  {children}
                </TooltipProvider>
              </SocketProvider>
            </AppStateProvider>
          </SupabaseUserProvider>
        </ThemeProvider>
        <Toaster richColors theme="system" pauseWhenPageIsHidden />
      </body>
    </html>
  );
}
