import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { RequireLogin, Screen } from "../components/Common.jsx";

const LINK = { case_law: (s) => `/cases/detail/${s.id}` };

function ChatInner() {
  const [msgs, setMsgs] = useState([]);
  const [sid, setSid] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(e) {
    e.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    setText(""); setError(null); setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }]);
    try {
      const r = await api.post("/chat/ask", { message, session_id: sid });
      setSid(r.session_id);
      setMsgs((m) => [...m, { role: "assistant", content: r.answer, sources: r.sources }]);
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <>
      {msgs.length === 0 && <div className="note">Ask about GST rates, circulars, notifications or case law. Answers are drawn from the app’s own library and cite their sources.</div>}
      {msgs.map((m, i) => (
        <div key={i}>
          <div className={`bubble ${m.role}`}>{m.content}</div>
          {m.sources?.length > 0 && (
            <div className="muted" style={{ margin: "-2px 0 10px" }}>
              Sources: {m.sources.map((s) => (LINK[s.kind] ? <Link key={s.n} to={LINK[s.kind](s)} style={{ textDecoration: "underline", marginRight: 8 }}>[{s.n}] {s.title.slice(0, 40)}</Link>
                : <span key={s.n} style={{ marginRight: 8 }}>[{s.n}] {s.title.slice(0, 40)}</span>))}
            </div>
          )}
        </div>
      ))}
      {busy && <div className="bubble assistant muted">Thinking…</div>}
      {error && <div className="err">{error}</div>}
      <form onSubmit={send} style={{ display: "flex", gap: 8, position: "sticky", bottom: 70, background: "var(--parchment)", paddingTop: 8 }}>
        <input className="input" style={{ marginBottom: 0 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a GST question…" maxLength={4000} />
        <button className="btn" disabled={busy || !text.trim()}>Send</button>
      </form>
      <div ref={end} />
    </>
  );
}

export default function Chat() {
  return <Screen title="Ask ChatGST" back="/"><RequireLogin><ChatInner /></RequireLogin></Screen>;
}
