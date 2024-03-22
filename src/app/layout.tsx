import db from "@/lib/supabase/db";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import ThemeProvider from "@/lib/providers/theme.provider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={cn("min-h-screen h-full antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
