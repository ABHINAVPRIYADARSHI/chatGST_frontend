import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

// "**bold**" and footnote markers {{n}} -> <b>, <sup>
function Rich({ text }) {
  const parts = text.split(/(\{\{\d+\}\}|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (/^\{\{\d+\}\}$/.test(p)) return <sup key={i} style={{ color: "var(--brass)" }}>{p.slice(2, -2)}</sup>;
    if (/^\*\*.+\*\*$/.test(p)) return <b key={i}>{p.slice(2, -2)}</b>;
    return <span key={i}>{p}</span>;
  });
}

export function ActsHome() {
  const [q, setQ] = useState("");
  const acts = useApi("/acts");
  return (
    <Screen title="Acts & Rules" back="/">
      <SearchBox onChange={setQ} placeholder="Search provisions, e.g. input tax credit, reverse charge" />
      {q.length >= 2 ? (
        <PagedList path="/acts/search" params={{ q }} renderItem={(s) => (
          <Link className="card" key={`${s.act_key}-${s.num}`} to={`/acts/${s.act_key}/${s.num}`}>
            <div className="date mono">{s.act_label}</div>
            <div className="title">{s.kind === "rule" ? "Rule" : "Section"} {s.num} — {s.title}</div>
          </Link>)} />
      ) : (acts.data || []).map((a) => (
        <Link className="card" key={a.key} to={`/acts/${a.key}`}>
          <div className="title">{a.label}</div>
          <div className="muted">{a.count} {a.kind === "rule" ? "rules" : "sections"}{a.with_text < a.count ? ` · text loaded for ${a.with_text}` : ""}</div>
        </Link>))}
    </Screen>
  );
}

export function ActStructure() {
  const { key } = useParams();
  const { data, loading, error } = useApi(`/acts/${key}/structure`, undefined, [key]);
  return (
    <Screen title={data?.label || "Act"} back="/acts">
      {loading && <p className="muted">Loading…</p>}
      {error && <div className="err">{error}</div>}
      {data?.chapters.map((c) => (
        <details key={c.chapter} className="card" open={data.chapters.length === 1}>
          <summary className="title" style={{ cursor: "pointer" }}>{c.chapter} <span className="muted">({c.items.length})</span></summary>
          {c.items.map((it) => (
            <div key={it.num} style={{ padding: "8px 0", borderTop: "1px solid var(--hair)" }}>
              {it.has_text ? <Link to={`/acts/${key}/${it.num}`}><b>{it.num}.</b> {it.title}</Link>
                : <span className="muted"><b>{it.num}.</b> {it.title} (text not loaded)</span>}
            </div>))}
        </details>))}
    </Screen>
  );
}

export function ActSection() {
  const { key, num } = useParams();
  const { data: s, loading, error } = useApi(`/acts/${key}/sections/${num}`, undefined, [key, num]);
  return (
    <Screen title={s ? `${s.kind === "rule" ? "Rule" : "Section"} ${s.num}` : "Provision"} back>
      {loading && <p className="muted">Loading…</p>}
      {error && <div className="err">{error}</div>}
      {s && (<>
        <div className="mono muted">{s.act_label} · {s.chapter}</div>
        <h2 className="display" style={{ margin: "6px 0 12px" }}>{s.title}</h2>
        {s.body.map((p, i) => <p key={i} style={{ lineHeight: 1.65, margin: "0 0 10px" }}><Rich text={p} /></p>)}
        {s.footnotes.length > 0 && <><div className="sec">Amendments / footnotes</div>
          {s.footnotes.map((f) => <p key={f.id} className="muted" style={{ margin: "0 0 6px" }}><sup>{f.id}</sup> {f.text}</p>)}</>}
      </>)}
    </Screen>
  );
}
