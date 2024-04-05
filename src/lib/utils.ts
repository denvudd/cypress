import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAX_FOLDERS_FREE_PLAN } from "./config/global/constants";

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
