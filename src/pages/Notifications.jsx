import { useState } from "react";
import { Chips, PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

const LABELS = { ct: "CGST", ctr: "CGST Rate", igst: "IGST", igstr: "IGST Rate", cess: "Cess", cessr: "Cess Rate", utgst: "UTGST", utgstr: "UTGST Rate" };

export default function Notifications() {
  const [cat, setCat] = useState("ct");
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const cats = useApi("/notifications/categories");
  const years = useApi("/notifications/years", { category: cat }, [cat]);
  const catOptions = (cats.data || []).map((c) => ({ ...c, label: LABELS[c.key] || c.key }));
  return (
    <Screen title="Notifications" back="/">
      <SearchBox onChange={setQ} placeholder="Search notifications…" />
      <Chips options={catOptions} value={cat} onChange={(v) => { setCat(v || "ct"); setYear(""); }} allLabel="CGST" />
      <Chips options={years.data || []} value={year} onChange={setYear} allLabel="All years" />
      <PagedList path="/notifications" params={{ category: cat, year, q }}
        renderItem={(n) => (
          <button className="card" key={n.id} onClick={() => setOpen(open === n.id ? null : n.id)}>
            <div className="date mono">{n.date_text}</div>
            <div className="title">{n.head}</div>
            <div className="desc">{n.subject}</div>
            {open === n.id && n.summary?.length > 0 && <ul className="desc" style={{ paddingLeft: 18 }}>{n.summary.map((s, i) => <li key={i}>{s}</li>)}</ul>}
            {n.pdf_url && <a className="btn ghost" style={{ marginTop: 8, padding: "6px 12px" }} href={n.pdf_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Open PDF</a>}
          </button>
        )} />
    </Screen>
  );
}
