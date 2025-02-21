import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const storeReferralCode = (code: string) => {
  localStorage.setItem('pendingReferralCode', code);
};

export const getPendingReferralCode = () => {
  return localStorage.getItem('pendingReferralCode');
};

export const clearPendingReferralCode = () => {
  localStorage.removeItem('pendingReferralCode');
};