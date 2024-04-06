import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAX_FOLDERS_FREE_PLAN } from "./config/global/constants";
import { Price } from "@/types/supabase.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUsagePercantage(foldersLength: number) {
  return Math.round((foldersLength / MAX_FOLDERS_FREE_PLAN) * 100);
}

export function getRandomEmoji() {
  const businessEmojis = [
    "💼",
    "📊",
    "💹",
    "💱",
    "📈",
    "📉",
    "💻",
    "💰",
    "📅",
    "📈",
  ];
  const randomIndex = Math.floor(Math.random() * businessEmojis.length);

  return businessEmojis[randomIndex];
}

export function generateColorFromEmail(email: string) {
  const hash = email
    .split("")
    .reduce((prevHash, currChar) => prevHash + currChar.charCodeAt(0), 0);

  return `hsl(${hash % 360}, 35%, 35%)`;
}

export function formatPrice(price: Price) {
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || undefined,
    minimumFractionDigits: 0,
  }).format(price?.unitAmount || 0 / 100);

  return priceString;
}
