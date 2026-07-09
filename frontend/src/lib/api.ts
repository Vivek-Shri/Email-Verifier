export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://92.113.151.55:8000/api/v1";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  return response;
}
