import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export function Screen({ title, back, action, children }) {
  const nav = useNavigate();
  return (
    <>
      <div className="topbar">
        {back && <button className="back" aria-label="Back" onClick={() => (back === true ? nav(-1) : nav(back))}>‹</button>}
        <h1 className="display">{title}</h1>
        {action}
      </div>
      <div className="page">{children}</div>
    </>
  );
}

/** Fetch helper with loading/error state; re-runs when deps change; aborts stale requests. */
export function useApi(path, params, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    if (path === null) return;
    const ac = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path, params, ac.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (e.name !== "AbortError") setState({ data: null, loading: false, error: e.message }); });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  return state;
}

export function Chips({ options, value, onChange, allLabel = "All" }) {
  return (
    <div className="chips" role="tablist">
      <button className={`chip ${!value ? "on" : ""}`} onClick={() => onChange("")}>{allLabel}</button>
      {options.map((o) => (
        <button key={o.key} className={`chip ${value === o.key ? "on" : ""}`} onClick={() => onChange(o.key)}>
          {o.label || o.key}{o.count != null && <span className="muted" style={{ marginLeft: 5, color: "inherit", opacity: .6 }}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }) {
  const [v, setV] = useState(value || "");
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <input className="input" type="search" value={v} placeholder={placeholder || "Search…"}
      onChange={(e) => { setV(e.target.value); clearTimeout(t.current); const val = e.target.value; t.current = setTimeout(() => onChange(val.trim()), 350); }} />
  );
}

/** Infinite "load more" list over a paginated endpoint. */
export function PagedList({ path, params, renderItem, empty = "Nothing found.", deps = [] }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify([path, params, ...deps]);

  useEffect(() => { setItems([]); setPage(1); setTotal(0); }, [key]);
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true); setError(null);
    api.get(path, { ...params, page, page_size: 25 }, ac.signal)
      .then((r) => { setItems((prev) => (page === 1 ? r.items : [...prev, ...r.items])); setTotal(r.total); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setLoading(false); } });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page]);

  return (
    <>
      {error && <div className="err">{error}</div>}
      {!loading && !error && items.length === 0 && <p className="muted">{empty}</p>}
      {total > 0 && <p className="muted" style={{ margin: "0 0 8px" }}>{total.toLocaleString("en-IN")} result{total === 1 ? "" : "s"}</p>}
      {items.map(renderItem)}
      {loading && <p className="muted">Loading…</p>}
      {!loading && items.length < total && (
        <button className="btn ghost block mono" style={{ fontSize: 11, letterSpacing: 1 }} onClick={() => setPage((p) => p + 1)}>
          LOAD MORE ({items.length} of {total})
        </button>
      )}
    </>
  );
}

export function DispositionPill({ c }) {
  if (!c.disposition_verified || c.disposition === "unknown") return null;
  const label = { favour: "In Favour of the Assessee", against: "Against the Assessee", mixed: "Mixed Outcome" }[c.disposition];
  return <span className={`pill ${c.disposition}`}>{label}</span>;
}

export function RequireLogin({ children }) {
  const nav = useNavigate();
  const [me, setMe] = useState(undefined);
  useEffect(() => { api.get("/auth/me").then(setMe).catch(() => setMe(null)); }, []);
  if (me === undefined) return <p className="muted">Loading…</p>;
  if (me === null) return (
    <div className="note">Please sign in to use this feature. <button className="btn" style={{ marginLeft: 8 }} onClick={() => nav("/settings")}>Sign in</button></div>
  );
  return children;
}
