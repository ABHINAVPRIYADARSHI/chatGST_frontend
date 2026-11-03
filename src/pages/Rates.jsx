import { useState } from "react";
import { PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

export default function Rates() {
  const [q, setQ] = useState("");
  const sched = useApi("/rates/schedules");
  return (
    <Screen title="GST rates" back="/">
      <SearchBox onChange={setQ} placeholder="Item or HSN, e.g. toys, 9503, mobile phone" />
      {q.length >= 2 ? (
        <PagedList path="/rates/search" params={{ q }} empty="No matching item. Try a broader word or the HSN chapter."
          renderItem={(r, i) => (
            <div className="card" key={`${r.hsn}-${i}`}>
              <div className="date mono">HSN {r.hsn}</div>
              <div className="title">{r.description}</div>
              <div className="court">{r.schedule_label} — CGST {r.cgst}% + SGST {r.sgst}% = IGST {r.igst}%</div>
              <div className="muted" style={{ marginTop: 4 }}>{r.source}</div>
            </div>
          )} />
      ) : (
        <>
          <p className="muted">Type at least 2 characters to search, or browse the schedules:</p>
          {(sched.data || []).map((s) => (
            <div className="card" key={s.key}>
              <div className="title">{s.label}</div>
              <div className="court">CGST {s.cgst}% + SGST {s.sgst}% (IGST {s.igst}%)</div>
              <div className="muted">{s.item_count.toLocaleString("en-IN")} items · {s.source}</div>
            </div>
          ))}
        </>
      )}
    </Screen>
  );
}
