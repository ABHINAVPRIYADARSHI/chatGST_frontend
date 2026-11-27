import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Chips, DispositionPill, PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

const COURTS = [
  { key: "sc", label: "Supreme Court", sub: "Judgments" },
  { key: "hc", label: "High Courts", sub: "Orders" },
  { key: "gstat", label: "GSTAT", sub: "Judgments" },
  { key: "aaar", label: "AAAR", sub: "Appellate Rulings" },
  { key: "aar", label: "AAR", sub: "Advance Rulings" },
];

const TITLES = {
  sc: "Supreme Court Judgements",
  hc: "High Court Orders",
  gstat: "GSTAT Judgements",
  aaar: "AAAR Rulings",
  aar: "AAR Rulings",
};

const DEFAULT_HC_JURISDICTIONS = [
  { key: "Karnataka High Court", label: "Karnataka HC" },
  { key: "Calcutta High Court", label: "Calcutta HC" },
  { key: "Delhi High Court", label: "Delhi HC" },
  { key: "Madras High Court", label: "Madras HC" },
  { key: "Allahabad High Court", label: "Allahabad HC" },
  { key: "Gujarat High Court", label: "Gujarat HC" },
  { key: "Bombay High Court", label: "Bombay HC" },
  { key: "Orissa High Court", label: "Orissa HC" },
  { key: "Tripura High Court", label: "Tripura HC" },
];

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
  const [jurisdiction, setJurisdiction] = useState("");
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const [disp, setDisp] = useState("");

  const courtFacets = useApi("/cases/facets/courts");
  const counts = Object.fromEntries((courtFacets.data || []).map((c) => [c.key, c.count]));
  const years = useApi("/cases/facets/years", court ? { court } : undefined, [court]);
  const jurisdictions = useApi("/cases/facets/jurisdictions", court === "hc" ? { court: "hc" } : null, [court]);

  const hcOptions = (
    jurisdictions.data && jurisdictions.data.length > 0
      ? jurisdictions.data
      : DEFAULT_HC_JURISDICTIONS
  ).map((item) => ({
    key: item.key,
    label: item.label || item.key.replace(" High Court", " HC"),
    count: item.count,
  }));

  return (
    <Screen title={court ? (TITLES[court] || "Case law") : "Case Laws"} back={court ? "/cases" : "/"}>
      {!court && (
        <div className="grid" style={{ marginBottom: 18 }}>
          {COURTS.map((c) => (
            <Link key={c.key} to={`/cases/${c.key}`} className="tile">
              <b className="display">{c.label}</b>
              <small>
                {counts[c.key] != null ? `${counts[c.key].toLocaleString("en-IN")} ${c.sub.toLowerCase()}` : c.sub}
              </small>
            </Link>
          ))}
        </div>
      )}

      {!court && <div className="sec">Search & Filter All Case Law</div>}

      <SearchBox onChange={setQ} placeholder="Search party, issue, citation…" />

      {court === "hc" && (
        <div style={{ marginBottom: 6 }}>
          <div className="sec" style={{ margin: "10px 0 6px", fontSize: 11 }}>High Court Jurisdiction</div>
          <Chips
            options={hcOptions}
            value={jurisdiction}
            onChange={setJurisdiction}
            allLabel="All High Courts"
          />
        </div>
      )}

      <Chips options={years.data || []} value={year} onChange={setYear} allLabel="All years" />
      <Chips
        options={[
          { key: "favour", label: "In favour" },
          { key: "against", label: "Against" },
          { key: "mixed", label: "Mixed" },
        ]}
        value={disp}
        onChange={setDisp}
        allLabel="Any outcome"
      />
      {disp && (
        <p className="muted" style={{ marginTop: -4 }}>
          Outcome filters include only orders whose outcome has been read and verified.
        </p>
      )}
      <PagedList
        path="/cases"
        params={{
          court: court || undefined,
          court_name: jurisdiction || undefined,
          year,
          q,
          disposition: disp,
        }}
        deps={[court, jurisdiction, year, disp, q]}
        renderItem={(c) => <CaseCard key={c.id} c={c} />}
      />
    </Screen>
  );
}
