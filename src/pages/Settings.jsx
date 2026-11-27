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

export default function Settings() {
  const [me, setMe] = useState(undefined);
  const load = () => api.get("/auth/me").then(setMe).catch(() => setMe(null));
  useEffect(() => { load(); }, []);
  return (
    <Screen title="Account settings" back="/">
      {me === undefined && <p className="muted">Loading…</p>}
      {me === null && <Login onDone={load} />}
      {me && (
        <p>Signed in as <b>{me.email}</b> <button className="chip" onClick={() => { auth.clear(); setMe(null); }}>Sign out</button></p>
      )}
    </Screen>
  );
}
