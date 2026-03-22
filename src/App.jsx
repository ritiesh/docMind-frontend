import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import UploadTab from "./components/UploadTab";
import ChatTab from "./components/ChatTab";
import HistoryTab from "./components/HistoryTab";
import "./styles/global.css";
import "./styles/app.css";

const TITLES = {
  "/chat": {
    title: "Ask your document",
    sub: "Powered by AI · answers grounded in your uploaded files",
  },
  "/upload": {
    title: "Documents",
    sub: "Upload PDF files to analyze and chat with",
  },
  "/history": {
    title: "Chat history",
    sub: "All your previous Q&A sessions",
  },
};

// ── Protected layout ───────────────────────────────────────────────────────
function AppLayout({ email, onLogout, hasDoc, setHasDoc, token }) {
  const location = useLocation();
  const meta = TITLES[location.pathname] || TITLES["/upload"];

  return (
    <div className="app">
      <Sidebar email={email} onLogout={onLogout} />

      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
        </div>

        <div className="content">
          <Routes>
            {/* New users → /upload, returning users with docs → /chat */}
            <Route
              index
              element={<Navigate to={hasDoc ? "/chat" : "/upload"} replace />}
            />
            <Route
              path="/chat"
              element={
                hasDoc ? (
                  <ChatTab token={token} email={email} hasDoc={hasDoc} />
                ) : (
                  <Navigate to="/upload" replace />
                )
              }
            />
            <Route
              path="/upload"
              element={
                <UploadTab
                  token={token}
                  onUploaded={() => setHasDoc(true)}
                  hasDoc={hasDoc}
                />
              }
            />
            <Route
              path="/history"
              element={<HistoryTab token={token} />}
            />
            <Route
              path="*"
              element={<Navigate to={hasDoc ? "/chat" : "/upload"} replace />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [email, setEmail] = useState(
    () => localStorage.getItem("email") || ""
  );
  const [hasDoc, setHasDoc] = useState(
    () => JSON.parse(localStorage.getItem("docs") || "[]").length > 0
  );

  const handleLogin = (t, e) => {
    setToken(t);
    setEmail(e);
    // reset hasDoc for fresh login
    const existingDocs = JSON.parse(localStorage.getItem("docs") || "[]");
    setHasDoc(existingDocs.length > 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("docs");
    setToken(null);
    setEmail("");
    setHasDoc(false);
  };

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AuthScreen onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppLayout
        token={token}
        email={email}
        onLogout={handleLogout}
        hasDoc={hasDoc}
        setHasDoc={setHasDoc}
      />
    </BrowserRouter>
  );
}