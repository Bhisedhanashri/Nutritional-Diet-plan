import { getAuthHeaders } from "./auth";

const API_URL = "";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = API_URL ? `${API_URL.replace(/\/$/, "")}${path}` : `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...(options.headers ?? {}) },
  });
  
  let data: any = null;
  const text = await res.text();
  if (text.trim() !== "") {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  
  if (!res.ok) throw data;
  return data as T;
}

export const api = {
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body: unknown) => req<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => req<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => req<T>(path, { method: "DELETE" }),
};
