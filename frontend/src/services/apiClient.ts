const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem("stadiumsense_token");
}

export function setToken(token: string) {
  localStorage.setItem("stadiumsense_token", token);
}

export function clearToken() {
  localStorage.removeItem("stadiumsense_token");
  localStorage.removeItem("stadiumsense_user");
}

function handle401() {
  clearToken();
  window.location.href = "/login";
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...((options?.headers as Record<string, string>) || {}) };
  if (token && token !== "undefined" && token !== "null") headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) { handle401(); throw new ApiError(401, "Session expired"); }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || body?.detail || body?.error || res.statusText;
    throw new ApiError(res.status, typeof msg === "string" ? msg : res.statusText);
  }
  return res.json();
}

export function apiStream(path: string, body: unknown, onToken: (t: string) => void, onDone: () => void, onError: (e: Error) => void): AbortController {
  const ctrl = new AbortController();
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token && token !== "undefined" && token !== "null") headers["Authorization"] = `Bearer ${token}`;

  fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (res.status === 401) { handle401(); onError(new ApiError(401, "Session expired")); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        onError(new ApiError(res.status, err?.error?.message || err.detail || res.statusText));
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") { onDone(); return; }
            onToken(data);
          }
        }
      }
      onDone();
    })
    .catch((e) => { if (e.name !== "AbortError") onError(e); });
  return ctrl;
}
