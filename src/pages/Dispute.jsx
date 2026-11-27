import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { RequireLogin, Screen } from "../components/Common.jsx";

const TYPES = ["notice", "letter", "summons", "order"];

function Inner() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("notice");
  const [proceeding, setProceeding] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [res, setRes] = useState(null);

  async function run(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setError(null); setRes(null);
    const f = new FormData();
    f.append("file", file); f.append("doc_type", docType); f.append("proceeding", proceeding); f.append("notes", notes);
    try { setRes(await api.upload("/dispute/analyze", f)); } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <>
      <form onSubmit={run}>
        <div className="chips">{TYPES.map((t) => <button type="button" key={t} className={`chip ${docType === t ? "on" : ""}`} onClick={() => setDocType(t)}>{t}</button>)}</div>
        <input className="input" placeholder="Proceeding (e.g. Section 73 demand, ITC mismatch)" value={proceeding} onChange={(e) => setProceeding(e.target.value)} maxLength={200} />
        <textarea className="input" rows={3} placeholder="Facts / notes from your side (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} />
        <input className="input" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="btn block" disabled={!file || busy}>{busy ? "Analysing… (can take a minute)" : "Analyse & draft reply"}</button>
      </form>
      {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}
      {res && (
        <>
          <div className="note" style={{ marginTop: 14 }}>{res.disclaimer}</div>
          {res.extracted && <><div className="sec">Extracted</div><pre className="reply">{JSON.stringify(res.extracted, null, 2)}</pre></>}
          {res.legalProvisions?.length > 0 && <><div className="sec">Legal provisions (taxpayer-favourable reading)</div>
            {res.legalProvisions.map((p, i) => <div className="card" key={i}><div className="title">{p.provision}</div><div className="desc">{p.interpretation}</div></div>)}</>}
          {res.caseLaw?.length > 0 && <><div className="sec">Case law — Supreme Court → High Court → GSTAT → AAAR → AAR</div>
            {res.caseLaw.map((c, i) => <div className="card" key={i}><div className="court" style={{ marginTop: 0 }}>{c.court}</div><div className="title">{c.case}</div>
              {c.citation && <div className="muted">{c.citation}</div>}<div className="desc">{c.ratio}</div></div>)}</>}
          {res.libraryAuthorities?.length > 0 && <><div className="sec">From the app library</div>
            {res.libraryAuthorities.map((a) => <Link key={a.id} className="card" to={`/cases/detail/${a.id}`}><div className="court" style={{ marginTop: 0 }}>{a.court}</div><div className="title">{a.case}</div></Link>)}</>}
          {res.draftReply && <><div className="sec">Draft reply</div><pre className="reply">{res.draftReply}</pre>
            <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(res.draftReply)}>Copy reply</button></>}
        </>
      )}
    </>
  );
}

export default function Dispute() {
  return <Screen title="Dispute reply" back="/"><RequireLogin><Inner /></RequireLogin></Screen>;
}
