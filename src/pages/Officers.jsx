import { useState } from "react";
import { Chips, PagedList, Screen, SearchBox, useApi } from "../components/Common.jsx";

export default function Officers() {
  const [kind, setKind] = useState("cgst");
  const [group, setGroup] = useState("");
  const [q, setQ] = useState("");
  const groups = useApi("/officers/groups", { kind }, [kind]);
  return (
    <Screen title="Officers directory" back="/">
      <Chips options={[{ key: "sgst", label: "SGST (States)" }]} value={kind === "sgst" ? "sgst" : ""} allLabel="CGST (Zones)"
        onChange={(v) => { setKind(v || "cgst"); setGroup(""); }} />
      <SearchBox onChange={setQ} placeholder="Search name, office, email…" />
      <select className="input" value={group} onChange={(e) => setGroup(e.target.value)}>
        <option value="">{kind === "cgst" ? "All zones" : "All states"}</option>
        {(groups.data || []).map((g) => <option key={g.key} value={g.key}>{g.key} ({g.count})</option>)}
      </select>
      <PagedList path="/officers" params={{ kind, group, q }}
        renderItem={(o) => (
          <div className="card" key={o.id}>
            <div className="date mono">{o.group_name}</div>
            <div className="title">{o.title}</div>
            {o.address && o.address !== "—" && <div className="desc">{o.address}</div>}
            <div className="desc">
              {o.phone && <a href={`tel:${o.phone.split(/[,/;]/)[0].replace(/[^+\d]/g, "")}`}>📞 {o.phone}</a>}
              {o.email && <div><a href={`mailto:${o.email.split(/[,;\s]/)[0]}`}>✉ {o.email}</a></div>}
            </div>
          </div>
        )} />
    </Screen>
  );
}
