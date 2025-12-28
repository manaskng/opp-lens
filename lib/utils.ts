import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import qs from "query-string";


export function formUrlQuery({ params, key, value }: { params: string; key: string; value: string | null }) {
  const currentUrl = qs.parse(params);
  currentUrl[key] = value;
  return qs.stringifyUrl({ url: window.location.pathname, query: currentUrl }, { skipNull: true });
}

export function removeKeysFromQuery({ params, keysToRemove }: { params: string; keysToRemove: string[] }) {
  const currentUrl = qs.parse(params);
  keysToRemove.forEach((key) => delete currentUrl[key]);
  return qs.stringifyUrl({ url: window.location.pathname, query: currentUrl }, { skipNull: true });
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
};

// to parse the json
export function sanitizeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}
