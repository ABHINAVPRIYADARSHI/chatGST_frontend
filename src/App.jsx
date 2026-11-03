import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Library from "./pages/Library.jsx";
import Notifications from "./pages/Notifications.jsx";
import Cases from "./pages/Cases.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import Officers from "./pages/Officers.jsx";
import Rates from "./pages/Rates.jsx";
import News from "./pages/News.jsx";
import Chat from "./pages/Chat.jsx";
import Dispute from "./pages/Dispute.jsx";
import Settings from "./pages/Settings.jsx";
import { ActsHome, ActStructure, ActSection } from "./pages/Acts.jsx";

const NAV = [["/", "⌂", "Home"], ["/chat", "✎", "Ask"], ["/dispute", "⚖", "Dispute"], ["/news", "✉", "News"], ["/settings", "☺", "Account"]];

export default function App() {
  return (
    <div className="shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acts" element={<ActsHome />} />
        <Route path="/acts/:key" element={<ActStructure />} />
        <Route path="/acts/:key/:num" element={<ActSection />} />
        <Route path="/library/:kind" element={<Library />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/cases/detail/:id" element={<CaseDetail />} />
        <Route path="/cases/:court" element={<Cases />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/rates" element={<Rates />} />
        <Route path="/news" element={<News />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dispute" element={<Dispute />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div className="page"><h2 className="display">Page not found</h2></div>} />
      </Routes>
      <nav className="nav"><div>
        {NAV.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}><span>{icon}</span>{label}</NavLink>
        ))}
      </div></nav>
    </div>
  );
}
