import { useState } from "react";
import { useParams } from "react-router-dom";
import { Chips, PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

export default function Library() {
  const { kind } = useParams(); // circulars | instructions
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const years = useApi(`/${kind}/years`, undefined, [kind]);
  return (
    <Screen title={kind === "circulars" ? "Circulars" : "Instructions"} back="/acts">
      <SearchBox onChange={setQ} placeholder={`Search ${kind}…`} />
      <Chips options={years.data || []} value={year} onChange={setYear} allLabel="All years" />
      <PagedList path={`/${kind}`} params={{ year, q }} deps={[kind]}
        renderItem={(d) => (
          <div className="card" key={d.id}>
            {d.date_text && <div className="date mono">{d.date_text}</div>}
            <div className="title">{d.title}</div>
            <div className="desc">{d.subject}</div>
            {d.pdf_url && <a className="btn ghost" style={{ marginTop: 8, padding: "6px 12px" }} href={d.pdf_url} target="_blank" rel="noreferrer">Open PDF</a>}
          </div>
        )} />
    </Screen>
  );
}
