const BASE = import.meta.env.VITE_API_BASE || "/api/v1";
const TOKEN_KEY = "chatgst_token";

export const auth = {
  get() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage unavailable */ } },
  clear() { try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ } },
};

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function request(path, { method = "GET", params, json, form, signal } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v); });
  const headers = {};
  const t = auth.get();
  if (t) headers.Authorization = `Bearer ${t}`;
  let body;
  if (json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  else if (form) body = form;
  const res = await fetch(url, { method, headers, body, signal });
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON error body */ }
  if (!res.ok) {
    if (res.status === 401) auth.clear();
    const d = data?.detail;
    throw new ApiError(res.status, typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x.msg).join("; ") : `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (p, params, signal) => request(p, { params, signal }),
  post: (p, json) => request(p, { method: "POST", json }),
  put: (p, json) => request(p, { method: "PUT", json }),
  del: (p) => request(p, { method: "DELETE" }),
  upload: (p, form) => request(p, { method: "POST", form }),
  async login(email, password) {
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(BASE + "/auth/login", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Login failed");
    auth.set(data.access_token);
  },
  async register(email, password) {
    const data = await request("/auth/register", { method: "POST", json: { email, password } });
    auth.set(data.access_token);
  },
};
