import { Link } from "react-router-dom";
import { Screen, useApi } from "../components/Common.jsx";

const TILES = [
  ["/acts", "Acts & Rules", "CGST · IGST · Cess · Rules"],
  ["/library/circulars", "Circulars", "Year-wise"], ["/library/instructions", "Instructions", "Year-wise"],
  ["/notifications", "Notifications", "CGST · IGST · Rate"], ["/cases/sc", "Supreme Court", "Judgments"],
  ["/cases/hc", "High Courts", "Orders"], ["/cases/gstat", "GSTAT", "Judgments"],
  ["/cases/aaar", "AAAR", "Rulings"], ["/cases/aar", "AAR", "Rulings"],
  ["/rates", "GST Rates", "Search by item / HSN"], ["/officers", "Officers", "CGST & SGST"],
  ["/news", "News", "Live GST feed"], ["/dispute", "Dispute reply", "AI-drafted"],
];

export default function Home() {
  const { data } = useApi("/cases/facets/courts");
  const counts = Object.fromEntries((data || []).map((c) => [c.key, c.count]));
  return (
    <Screen title="ChatGST">
      <p className="muted" style={{ marginTop: 0 }}>GST law, circulars, notifications and case law in one place.</p>
      <div className="grid">
        {TILES.map(([to, name, sub]) => (
          <Link key={to} to={to} className="tile">
            <b className="display">{name}</b>
            <small>{to.startsWith("/cases/") && counts[to.split("/")[2]] != null ? `${counts[to.split("/")[2]].toLocaleString("en-IN")} ${sub.toLowerCase()}` : sub}</small>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
