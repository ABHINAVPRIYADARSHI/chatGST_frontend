import { useParams } from "react-router-dom";
import { DispositionPill, Screen, useApi } from "../components/Common.jsx";

export default function CaseDetail() {
  const { id } = useParams();
  const { data: c, loading, error } = useApi(`/cases/${id}`);
  return (
    <Screen title="Case details" back>
      {loading && <p className="muted">Loading…</p>}
      {error && <div className="err">{error}</div>}
      {c && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              {c.date_text && <div className="mono muted">{c.date_text}</div>}
              <h2 className="display" style={{ margin: "4px 0" }}>{c.title}</h2>
              <div style={{ color: "var(--brass)", fontWeight: 600 }}>
                {c.court_line}
                <span className={`tag ${c.tag === "CATALOGUED" ? "catalogued" : ""}`}>{c.tag}</span>
              </div>
              <DispositionPill c={c} />
            </div>
            {c.pdf_url && (
              <a
                className="btn"
                style={{ padding: "8px 16px", fontSize: 13, whiteSpace: "nowrap", marginTop: 4 }}
                href={c.pdf_url}
                target="_blank"
                rel="noreferrer"
              >
                Open original PDF ↗
              </a>
            )}
          </div>
          {c.tag === "CATALOGUED" && <div className="note" style={{ marginTop: 12 }}>Catalogued entry — the outcome of this order has not been independently read and verified, so no favour/against label is shown.</div>}
          {c.citation && <><div className="sec">Citation</div><div>{c.citation}</div></>}
          {c.case_no && <><div className="sec">Case number</div><div>{c.case_no}</div></>}
          {c.issue && <><div className="sec">Issue</div><div>{c.issue}</div></>}
          {c.summary && <><div className="sec">Summary</div><div style={{ lineHeight: 1.6 }}>{c.summary}</div></>}
          {c.full_text && <><div className="sec">Full text</div><pre className="reply">{c.full_text}</pre></>}
        </>
      )}
    </Screen>
  );
}
