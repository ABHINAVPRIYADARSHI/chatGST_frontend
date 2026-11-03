import { useEffect, useState } from "react";
import { api, auth } from "../api.js";
import { Screen } from "../components/Common.jsx";

function Login({ onDone }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); const [error, setError] = useState(null); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(null);
    try { await (mode === "login" ? api.login(email, password) : api.register(email, password)); onDone(); }
    catch (err) { setError(err.message); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit}>
      {error && <div className="err">{error}</div>}
      <input className="input" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="input" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Password (8–72 characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={72} required />
      <button className="btn block" disabled={busy}>{mode === "login" ? "Sign in" : "Create account"}</button>
      <p className="muted" style={{ textAlign: "center" }}>
        <button type="button" className="chip" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "New here? Create an account" : "Have an account? Sign in"}</button>
      </p>
    </form>
  );
}

function Provider({ p, reload }) {
  const [key, setKey] = useState(""); const [model, setModel] = useState(p.model); const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  async function save() {
    setBusy(true); setError(null);
    try { await api.put(`/ai/providers/${p.provider}`, { api_key: key, model, is_default: true }); setKey(""); reload(); }
    catch (e) { setError(e.message); }
    setBusy(false);
  }
  return (
    <div className="card">
      <div className="title">{p.label} {p.is_default && <span className="tag">DEFAULT</span>}</div>
      <div className="muted">{p.key_hint ? `Key saved (${p.key_hint})` : "No key saved"}{!p.supports_pdf && " · images only (no PDF)"}</div>
      {error && <div className="err" style={{ marginTop: 8 }}>{error}</div>}
      <input className="input" style={{ marginTop: 8 }} placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
      <input className="input" type="password" autoComplete="off" placeholder="Paste API key" value={key} onChange={(e) => setKey(e.target.value)} />
      <button className="btn" disabled={busy || key.length < 8} onClick={save}>Save & use</button>
      {p.key_hint && <button className="btn ghost" style={{ marginLeft: 8 }} onClick={async () => { await api.del(`/ai/providers/${p.provider}`); reload(); }}>Remove</button>}
    </div>
  );
}

export default function Settings() {
  const [me, setMe] = useState(undefined);
  const [providers, setProviders] = useState([]);
  const load = () => api.get("/auth/me").then((u) => { setMe(u); return api.get("/ai/providers").then(setProviders); }).catch(() => setMe(null));
  useEffect(() => { load(); }, []);
  return (
    <Screen title="Account & AI settings" back="/">
      {me === undefined && <p className="muted">Loading…</p>}
      {me === null && <Login onDone={load} />}
      {me && (
        <>
          <p>Signed in as <b>{me.email}</b> <button className="chip" onClick={() => { auth.clear(); setMe(null); }}>Sign out</button></p>
          <div className="note">Your API key is encrypted on our server and used only to call the provider you choose, for your own chat and dispute drafts. It is never sent back to the browser.</div>
          {providers.map((p) => <Provider key={p.provider + p.key_hint} p={p} reload={load} />)}
        </>
      )}
    </Screen>
  );
}
