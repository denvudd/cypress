import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAX_FOLDERS_FREE_PLAN } from "./config/constants";
import { Folder } from "@/types/supabase.types";
import { AppWorkspacesType } from "./providers/app-state.provider";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUsagePercantage(foldersLength: number) {
  return Math.round((foldersLength / MAX_FOLDERS_FREE_PLAN) * 100);
}