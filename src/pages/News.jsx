import { useState } from "react";
import { PagedList, Screen, SearchBox } from "../components/Common.jsx";

export default function News() {
  const [q, setQ] = useState("");
  return (
    <Screen title="GST news" back="/">
      <SearchBox onChange={setQ} placeholder="Search news…" />
      <PagedList path="/news" params={{ q }} empty="No news yet."
        renderItem={(n) => (
          <div className="card" key={n.id}>
            <div className="date mono">{n.published_text} · {n.source}{n.verified && <span className="tag">VERIFIED</span>}</div>
            <div className="title">{n.url ? <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a> : n.title}</div>
            {n.body && <div className="desc">{n.body.length > 280 ? n.body.slice(0, 280) + "…" : n.body}</div>}
          </div>
        )} />
    </Screen>
  );
}
