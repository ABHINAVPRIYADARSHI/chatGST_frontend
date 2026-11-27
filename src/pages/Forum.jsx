import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, auth } from "../api.js";
import { Chips, PagedList, RequireLogin, Screen, SearchBox } from "../components/Common.jsx";

const CATEGORIES = [
  { key: "itc", label: "ITC" },
  { key: "returns", label: "Returns" },
  { key: "registration", label: "Registration" },
  { key: "rates", label: "Rates" },
  { key: "ewaybill", label: "E-way Bill" },
  { key: "refund", label: "Refund" },
  { key: "audit", label: "Audit" },
  { key: "litigation", label: "Litigation" },
  { key: "export", label: "Export" },
  { key: "other", label: "Other" },
];

const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

function authorName(user, isAi = false) {
  if (isAi) return "ChatGST AI";
  if (!user) return "Anonymous";
  return user.full_name || user.email.split("@")[0];
}

function relTime(iso) {
  if (!iso) return "";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function renderInline(str, keyPrefix) {
  const parts = str.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((p, i) => {
    const k = `${keyPrefix}-${i}`;
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={k}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("_") && p.endsWith("_") && p.length > 2) return <em key={k}>{p.slice(1, -1)}</em>;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
      return <code key={k} className="mono" style={{ background: "var(--brass-bg)", padding: "1px 4px", borderRadius: 3, fontSize: "0.9em" }}>{p.slice(1, -1)}</code>;
    }
    return p;
  });
}

function renderMd(text) {
  if (!text) return null;
  const segments = text.split(/(```[\s\S]*?```)/g);
  return segments.map((seg, si) => {
    if (seg.startsWith("```") && seg.endsWith("```")) {
      const code = seg.slice(3, -3).replace(/^\w*\n/, "");
      return (
        <pre key={si} className="mono" style={{ background: "var(--parchment)", border: "1px solid var(--hair)", borderRadius: 6, padding: 10, overflowX: "auto", fontSize: 12.5 }}>
          <code>{code}</code>
        </pre>
      );
    }
    return seg.split(/\n{2,}/).filter((b) => b.trim()).map((block, bi) => {
      const lines = block.split("\n");
      if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
        return <ul key={`${si}-${bi}`} style={{ margin: "6px 0", paddingLeft: 20 }}>{lines.map((l, li) => <li key={li}>{renderInline(l.trim().replace(/^[-*]\s+/, ""), `${si}-${bi}-${li}`)}</li>)}</ul>;
      }
      if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
        return <ol key={`${si}-${bi}`} style={{ margin: "6px 0", paddingLeft: 20 }}>{lines.map((l, li) => <li key={li}>{renderInline(l.trim().replace(/^\d+\.\s+/, ""), `${si}-${bi}-${li}`)}</li>)}</ol>;
      }
      return <p key={`${si}-${bi}`} style={{ margin: "6px 0", lineHeight: 1.55 }}>{lines.map((l, li) => <span key={li}>{li > 0 && <br />}{renderInline(l, `${si}-${bi}-${li}`)}</span>)}</p>;
    });
  });
}

export function Forum() {
  const nav = useNavigate();
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const isLoggedIn = Boolean(auth.get());

  return (
    <Screen title="Community" back="/">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="muted">GST Q&A Forum</span>
        <Link to="/chat" className="chip" style={{ fontWeight: 600 }}>Ask AI instead →</Link>
      </div>
      <SearchBox value={q} onChange={setQ} placeholder="Search forum questions…" />
      <Chips options={CATEGORIES} value={category} onChange={setCategory} />
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button className={`chip ${sort === "newest" ? "on" : ""}`} onClick={() => setSort("newest")}>Newest</button>
        <button className={`chip ${sort === "top" ? "on" : ""}`} onClick={() => setSort("top")}>Top</button>
      </div>
      <PagedList
        path="/forum/questions"
        params={{ category, q, sort }}
        deps={[category, q, sort]}
        empty="No questions yet. Be the first to ask!"
        renderItem={(item) => (
          <Link key={item.id} to={`/forum/${item.id}`} className="card">
            <div className="title">{item.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              <span className="tag" style={{ marginLeft: 0 }}>{CAT_LABEL[item.category] || item.category}</span>
              {(item.tags || []).map((t) => <span key={t} className="chip" style={{ padding: "1px 8px", fontSize: 11 }}>{t}</span>)}
            </div>
            <div className="muted" style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span>▲ {item.vote_count}</span>
              <span>{item.answer_count} answer{item.answer_count === 1 ? "" : "s"}</span>
              <span>{authorName(item.user)}</span>
              <span>{relTime(item.created_at)}</span>
            </div>
          </Link>
        )}
      />
      {isLoggedIn && (
        <div style={{ position: "sticky", bottom: 76, display: "flex", justifyContent: "flex-end", pointerEvents: "none", marginTop: 12 }}>
          <button className="btn" style={{ pointerEvents: "auto", boxShadow: "0 4px 12px rgba(22,36,59,.2)" }} onClick={() => nav("/forum/ask")}>
            + Post a question
          </button>
        </div>
      )}
    </Screen>
  );
}

function ForumAskInner() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [tagsRaw, setTagsRaw] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (t.length < 10) return setError("Title must be at least 10 characters.");
    if (b.length < 20) return setError("Question details must be at least 20 characters.");
    const tags = tagsRaw.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).slice(0, 3);
    setBusy(true); setError(null);
    try {
      const res = await api.post("/forum/questions", { title: t, body: b, category, tags });
      nav(`/forum/${res.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      {error && <div className="err">{error}</div>}
      <label className="muted" style={{ display: "block", marginBottom: 4 }}>Title</label>
      <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your GST question (min 10 chars)" minLength={10} maxLength={300} required />
      <label className="muted" style={{ display: "block", marginBottom: 4 }}>Category</label>
      <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
      <label className="muted" style={{ display: "block", marginBottom: 4 }}>Tags (optional)</label>
      <input className="input" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="Up to 3 tags, comma-separated (e.g. gstr-3b, sec-16)" />
      <label className="muted" style={{ display: "block", marginBottom: 4 }}>Details</label>
      <textarea className="input" rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe the facts, section/rule, and what you need clarity on (min 20 chars)…" minLength={20} maxLength={10000} required />
      <p className="muted" style={{ margin: "-4px 0 12px", fontSize: 12 }}>Supports **bold**, _italic_, `code`, and - lists.</p>
      <button className="btn block" disabled={busy}>{busy ? "Posting…" : "Post Question"}</button>
    </form>
  );
}

export function ForumAsk() {
  return <Screen title="Post a Question" back="/forum"><RequireLogin><ForumAskInner /></RequireLogin></Screen>;
}

function CommentThread({ answer, me, onAdded, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (body.length < 2 || busy) return;
    setBusy(true); setErr(null);
    try {
      const c = await api.post(`/forum/answers/${answer.id}/comments`, { body });
      onAdded(answer.id, c);
      setText(""); setOpen(false);
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  }

  async function delComment(cid) {
    try {
      await api.del(`/forum/comments/${cid}`);
      onDeleted(answer.id, cid);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--hair)", fontSize: 12, color: "var(--ink-soft)" }}>
      {(answer.comments || []).map((c) => (
        <div key={c.id} style={{ padding: "4px 0", borderBottom: "1px dashed var(--hair)", display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span>
            {c.body} — <b>{authorName(c.user)}</b> · {relTime(c.created_at)}
          </span>
          {me && (me.id === c.user?.id || me.is_admin) && (
            <button type="button" onClick={() => delComment(c.id)} title="Delete comment" style={{ background: "none", border: 0, cursor: "pointer", color: "var(--ag)", padding: "0 4px" }}>×</button>
          )}
        </div>
      ))}
      {err && <div className="err" style={{ marginTop: 6, fontSize: 12 }}>{err}</div>}
      <div style={{ marginTop: 6 }}>
        {!me ? (
          <span>Sign in to comment</span>
        ) : open ? (
          <form onSubmit={submit} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              className="input"
              style={{ marginBottom: 0, padding: "5px 8px", fontSize: 12 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => { if (!text.trim()) setOpen(false); }}
              placeholder="Write a comment (min 2 chars)…"
              maxLength={1000}
              autoFocus
            />
            <button className="chip on" type="submit" disabled={busy || text.trim().length < 2}>Submit</button>
          </form>
        ) : (
          <button type="button" className="chip" style={{ fontSize: 11.5, padding: "3px 9px" }} onClick={() => setOpen(true)}>Add a comment</button>
        )}
      </div>
    </div>
  );
}

export function ForumDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ansText, setAnsText] = useState("");
  const [ansBusy, setAnsBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [actionErr, setActionErr] = useState(null);

  const [editingQ, setEditingQ] = useState(false);
  const [editQTitle, setEditQTitle] = useState("");
  const [editQBody, setEditQBody] = useState("");

  const [editingAId, setEditingAId] = useState(null);
  const [editABody, setEditABody] = useState("");

  function loadDetail() {
    setLoading(true);
    api.get(`/forum/questions/${id}`)
      .then((data) => { setQ(data); setError(null); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }

  useEffect(() => {
    loadDetail();
    if (auth.get()) api.get("/auth/me").then(setMe).catch(() => setMe(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleQuestionVote() {
    if (!me) return;
    try {
      const r = await api.post(`/forum/questions/${q.id}/vote`);
      setQ((prev) => ({ ...prev, vote_count: r.vote_count, my_vote: r.voted }));
    } catch (e) { setActionErr(e.message); }
  }

  async function toggleAnswerVote(aid) {
    if (!me) return;
    try {
      const r = await api.post(`/forum/answers/${aid}/vote`);
      setQ((prev) => ({
        ...prev,
        answers: prev.answers.map((a) => (a.id === aid ? { ...a, vote_count: r.vote_count, my_vote: r.voted } : a)),
      }));
    } catch (e) { setActionErr(e.message); }
  }

  async function saveQuestionEdit(e) {
    e.preventDefault();
    try {
      const updated = await api.put(`/forum/questions/${q.id}`, { title: editQTitle, body: editQBody });
      setQ(updated);
      setEditingQ(false);
    } catch (err) { setActionErr(err.message); }
  }

  async function deleteQuestion() {
    try {
      await api.del(`/forum/questions/${q.id}`);
      nav("/forum");
    } catch (err) { setActionErr(err.message); }
  }

  async function saveAnswerEdit(e, aid) {
    e.preventDefault();
    try {
      const updated = await api.put(`/forum/answers/${aid}`, { body: editABody });
      setQ((prev) => ({
        ...prev,
        answers: prev.answers.map((a) => (a.id === aid ? { ...updated, my_vote: a.my_vote } : a)),
      }));
      setEditingAId(null);
    } catch (err) { setActionErr(err.message); }
  }

  async function deleteAnswer(aid) {
    try {
      await api.del(`/forum/answers/${aid}`);
      setQ((prev) => ({
        ...prev,
        answer_count: Math.max(0, prev.answer_count - 1),
        answers: prev.answers.filter((a) => a.id !== aid),
      }));
    } catch (err) { setActionErr(err.message); }
  }

  async function postAnswer(e) {
    e.preventDefault();
    if (ansText.trim().length < 10 || ansBusy) return;
    setAnsBusy(true); setActionErr(null);
    try {
      await api.post(`/forum/questions/${q.id}/answers`, { body: ansText.trim() });
      setAnsText("");
      loadDetail();
    } catch (err) { setActionErr(err.message); }
    setAnsBusy(false);
  }

  async function triggerAiAnswer() {
    if (aiBusy) return;
    setAiBusy(true); setActionErr(null);
    try {
      await api.post(`/forum/questions/${q.id}/ai-answer`);
      loadDetail();
    } catch (err) { setActionErr(err.message); }
    setAiBusy(false);
  }

  function handleCommentAdded(aid, comment) {
    setQ((prev) => ({
      ...prev,
      answers: prev.answers.map((a) => (a.id === aid ? { ...a, comments: [...(a.comments || []), comment] } : a)),
    }));
  }

  function handleCommentDeleted(aid, cid) {
    setQ((prev) => ({
      ...prev,
      answers: prev.answers.map((a) => (a.id === aid ? { ...a, comments: (a.comments || []).filter((c) => c.id !== cid) } : a)),
    }));
  }

  return (
    <Screen title="Discussion" back="/forum">
      {loading && !q && <p className="muted">Loading…</p>}
      {error && <div className="err">{error}</div>}
      {actionErr && <div className="err">{actionErr}</div>}
      {q && (
        <>
          <div className="card">
            {editingQ ? (
              <form onSubmit={saveQuestionEdit}>
                <input className="input" value={editQTitle} onChange={(e) => setEditQTitle(e.target.value)} minLength={10} maxLength={300} required />
                <textarea className="input" rows={6} value={editQBody} onChange={(e) => setEditQBody(e.target.value)} minLength={20} maxLength={10000} required />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" type="submit">Save</button>
                  <button className="btn ghost" type="button" onClick={() => setEditingQ(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="display" style={{ margin: "0 0 8px", fontSize: 20, lineHeight: 1.3 }}>{q.title}</h2>
                <div className="muted" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 10 }}>
                  <span>{authorName(q.user)}</span>
                  <span>· {relTime(q.created_at)}</span>
                  <span className="tag" style={{ marginLeft: 0 }}>{CAT_LABEL[q.category] || q.category}</span>
                  {(q.tags || []).map((t) => <span key={t} className="chip" style={{ padding: "1px 8px", fontSize: 11 }}>{t}</span>)}
                </div>
                <div>{renderMd(q.body)}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={q.my_vote ? "btn" : "btn ghost"}
                    style={{ padding: "6px 12px", fontSize: 13 }}
                    disabled={!me}
                    title={me ? "Upvote question" : "Sign in to vote"}
                    onClick={toggleQuestionVote}
                  >
                    ▲ Upvote ({q.vote_count})
                  </button>
                  {me && me.id === q.user?.id && (
                    <button type="button" className="chip" onClick={() => { setEditQTitle(q.title); setEditQBody(q.body); setEditingQ(true); }}>Edit</button>
                  )}
                  {me && (me.id === q.user?.id || me.is_admin) && (
                    <button type="button" className="chip" style={{ color: "var(--ag)" }} onClick={deleteQuestion}>Delete</button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="sec">{q.answers.length} Answer{q.answers.length === 1 ? "" : "s"}</div>
          {q.answers.length === 0 && <p className="muted">No answers yet. Share what you know or try an AI answer below.</p>}
          {q.answers.map((a) => (
            <div key={a.id} className="card">
              {editingAId === a.id ? (
                <form onSubmit={(e) => saveAnswerEdit(e, a.id)}>
                  <textarea className="input" rows={5} value={editABody} onChange={(e) => setEditABody(e.target.value)} minLength={10} maxLength={10000} required />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" type="submit">Save</button>
                    <button className="btn ghost" type="button" onClick={() => setEditingAId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span className="muted">
                      <b>{authorName(a.user, a.is_ai)}</b> · {relTime(a.created_at)}
                      {a.is_ai && <span className="tag">AI Answer</span>}
                    </span>
                  </div>
                  <div>{renderMd(a.body)}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={a.my_vote ? "btn" : "btn ghost"}
                      style={{ padding: "5px 10px", fontSize: 12.5 }}
                      disabled={!me}
                      title={me ? "Upvote answer" : "Sign in to vote"}
                      onClick={() => toggleAnswerVote(a.id)}
                    >
                      ▲ {a.vote_count}
                    </button>
                    {me && !a.is_ai && me.id === a.user?.id && (
                      <button type="button" className="chip" onClick={() => { setEditingAId(a.id); setEditABody(a.body); }}>Edit</button>
                    )}
                    {me && (me.id === a.user?.id || me.is_admin) && (
                      <button type="button" className="chip" style={{ color: "var(--ag)" }} onClick={() => deleteAnswer(a.id)}>Delete</button>
                    )}
                  </div>
                  <CommentThread answer={a} me={me} onAdded={handleCommentAdded} onDeleted={handleCommentDeleted} />
                </>
              )}
            </div>
          ))}

          <div className="sec">Your Answer</div>
          <RequireLogin>
            <form onSubmit={postAnswer} className="card">
              <textarea
                className="input"
                rows={6}
                value={ansText}
                onChange={(e) => setAnsText(e.target.value)}
                placeholder="Write your answer (min 10 chars). Supports **bold**, _italic_, `code`, and - lists."
                minLength={10}
                maxLength={10000}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn" type="submit" disabled={ansBusy || ansText.trim().length < 10}>
                  {ansBusy ? "Posting…" : "Post Answer"}
                </button>
                <button className="btn ghost" type="button" disabled={aiBusy} onClick={triggerAiAnswer}>
                  {aiBusy ? "Generating AI Answer…" : "Get AI Answer"}
                </button>
              </div>
            </form>
          </RequireLogin>
        </>
      )}
    </Screen>
  );
}
