import { useState } from "react";
import { Chips, PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

export default function Forms() {
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const cats = useApi("/forms/categories");

  return (
    <Screen title="GST Forms" back="/acts">
      <SearchBox onChange={setQ} placeholder="Search form code, title, rule (e.g. REG-01, GSTR-1, Rule 8)…" />
      <Chips
        options={cats.data || []}
        value={category}
        onChange={setCategory}
        allLabel="All forms"
      />
      <PagedList
        path="/forms"
        params={{ category, q }}
        deps={[category]}
        empty="No forms found. Try a different search or category filter."
        renderItem={(f) => (
          <div className="card" key={f.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{f.form_code}</span>
              {f.category && <span className="tag" style={{ marginLeft: 0 }}>{f.category}</span>}
            </div>
            <div className="title" style={{ marginTop: 6, fontSize: 15 }}>{f.title}</div>
            {f.rule_reference && (
              <div className="court" style={{ marginTop: 4, fontSize: 12 }}>{f.rule_reference}</div>
            )}
            {f.description && <div className="desc">{f.description}</div>}
            {f.pdf_url && (
              <a
                className="btn ghost"
                style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }}
                href={f.pdf_url}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
            )}
          </div>
        )}
      />
    </Screen>
  );
}
