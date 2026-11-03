import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Chips, DispositionPill, PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

const TITLES = { sc: "Supreme Court Judgements", hc: "High Court Judgements", gstat: "GSTAT Judgements", aaar: "AAAR Judgements", aar: "AAR Judgements" };

export function CaseCard({ c }) {
  return (
    <Link className="card" to={`/cases/detail/${c.id}`}>
      {c.date_text && <div className="date mono">{c.date_text}</div>}
      <div className="title">{c.title}</div>
      {c.court_line && <div className="court">{c.court_line}</div>}
      {c.summary && <div className="desc">{c.summary.length > 320 ? c.summary.slice(0, 320) + "…" : c.summary}</div>}
      <DispositionPill c={c} />
    </Link>
  );
}

export default function Cases() {
  const { court } = useParams();
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const [disp, setDisp] = useState("");
  const years = useApi("/cases/facets/years", { court }, [court]);
  return (
    <Screen title={TITLES[court] || "Case law"} back="/">
      <SearchBox onChange={setQ} placeholder="Search party, issue, citation…" />
      <Chips options={years.data || []} value={year} onChange={setYear} allLabel="All years" />
      <Chips options={[{ key: "favour", label: "In favour" }, { key: "against", label: "Against" }, { key: "mixed", label: "Mixed" }]}
        value={disp} onChange={setDisp} allLabel="Any outcome" />
      {disp && <p className="muted" style={{ marginTop: -4 }}>Outcome filters include only orders whose outcome has been read and verified.</p>}
      <PagedList path="/cases" params={{ court, year, q, disposition: disp }} deps={[court]} renderItem={(c) => <CaseCard key={c.id} c={c} />} />
    </Screen>
  );
}
