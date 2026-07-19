const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function refreshSession(): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data.access_token);
  } catch {
    clearTimeout(id);
    return false;
  }
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...((options?.headers as Record<string, string>) || {}) };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: "include", signal: controller.signal });
    clearTimeout(id);
    if (res.status === 401) {
      const refreshed = await refreshSession();
      if (refreshed) {
        const retryController = new AbortController();
        const retryId = setTimeout(() => retryController.abort(), 15000);
        try {
          const retry = await fetch(`${BASE}${path}`, { ...options, headers, credentials: "include", signal: retryController.signal });
          clearTimeout(retryId);
          if (retry.status === 401) { redirectLogin(); throw new ApiError(401, "Session expired"); }
          return retry.json();
        } catch (err: any) {
          clearTimeout(retryId);
          if (err.name === "AbortError") throw new ApiError(504, "Server connection timed out");
          throw err;
        }
      }
      redirectLogin();
      throw new ApiError(401, "Session expired");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.error?.message || body?.detail || body?.error || res.statusText;
      throw new ApiError(res.status, typeof msg === "string" ? msg : res.statusText);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === "AbortError") {
      throw new ApiError(504, "Server connection timed out");
    }
    throw err;
  }
}

function redirectLogin() {
  localStorage.removeItem("stadiumsense_user");
  window.location.href = "/login";
}

export function apiStream(path: string, body: unknown, onToken: (t: string) => void, onDone: () => void, onError: (e: Error) => void): AbortController {
  const ctrl = new AbortController();

  fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (res.status === 401) { redirectLogin(); onError(new ApiError(401, "Session expired")); return; }
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
            try {
              const parsed = JSON.parse(data);
              if (parsed && typeof parsed.token === "string") {
                onToken(parsed.token);
              } else {
                onToken(data);
              }
            } catch {
              onToken(data);
            }
          }
        }
      }
      onDone();
    })
    .catch((e) => { if (e.name !== "AbortError") onError(e); });
  return ctrl;
}
