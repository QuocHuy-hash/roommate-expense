import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path}`;
}

export async function apiRequest<T = any>(
  method: ApiMethod,
  path: string,
  options: {
    body?: BodyInit | null;
    headers?: Record<string, string>;
    isFormData?: boolean;
  } = {}
): Promise<T> {
  const url = apiUrl(path);

  const headers: Record<string, string> = options.headers ? { ...options.headers } : {};
  // Only set JSON headers if not sending FormData
  const isForm = options.isFormData === true || (typeof FormData !== "undefined" && options.body instanceof FormData);
  if (!isForm && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    credentials: "include",
    headers,
    body: options.body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${response.status}: ${text || response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  // @ts-expect-error allow text response generic
  return (await response.text()) as T;
}
