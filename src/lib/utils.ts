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

export function toDateTime(seconds: number) {
  const time = new Date("1970-01-01T00:30:00Z");
  time.getSeconds();

  return time;
}

export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_RAILWAY_URL ??
    "http://localhost:3000/";

  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;

  return url;
}

export async function postStripeData({
  url,
  data,
}: {
  url: string;
  data: { price: Price };
}) {
  const response: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json();
}
