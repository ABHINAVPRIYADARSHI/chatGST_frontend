import { Link } from "react-router-dom";
import { Screen, useApi } from "../components/Common.jsx";

const TILES = [
  ["/acts", "Acts & Rules", "Acts · Rules · Circulars · Notifications · Forms"],
  ["/cases", "Case Laws", "Supreme Court · High Courts · Tribunals · AAR"],
  ["/rates", "GST Rates", "Search by item / HSN"],
  ["/officers", "Officers", "CGST & SGST"],
  ["/news", "News", "Live GST feed"],
  ["/dispute", "Dispute reply", "AI-drafted"],
];

export default function Home() {
  const { data } = useApi("/cases/facets/courts");
  const totalCases = (data || []).reduce((sum, c) => sum + (c.count || 0), 0);
  return (
    <Screen title="ChatGST">
      <p className="muted" style={{ marginTop: 0 }}>GST law, circulars, notifications and case law in one place.</p>
      <div className="grid">
        {TILES.map(([to, name, sub]) => (
          <Link key={to} to={to} className="tile">
            <b className="display">{name}</b>
            <small>{to === "/cases" && totalCases > 0 ? `${totalCases.toLocaleString("en-IN")} judgments & orders` : sub}</small>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
