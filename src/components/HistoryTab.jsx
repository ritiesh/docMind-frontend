import { useState, useEffect } from "react";
import Icon from "./Icon";
import Icons from "./Icons";
import api from "../services/api";
import "../styles/history.css";

export default function HistoryTab({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api.history(token);
        if (!r.ok) throw new Error();
        const data = await r.json();
        setHistory(data.reverse());
      } catch {
        setError("Failed to load history. Make sure the backend is running.");
      }
      setLoading(false);
    })();
  }, [token]);

  const fmt = (s) => {
    try { return new Date(s).toLocaleString(); }
    catch { return s; }
  };

  if (loading) {
    return (
      <div className="history-loading">Loading history…</div>
    );
  }

  if (error) {
    return <div className="error-msg">{error}</div>;
  }

  if (!history.length) {
    return (
      <div className="empty-state">
        <Icon d={Icons.history} size={40} />
        <p>No chat history yet.</p>
        <p className="empty-sub">Start asking questions about your documents.</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {history.map((h) => (
        <div className="history-card" key={h.id}>
          <div className="history-q">
            <span className="q-label">Q</span>
            <span>{h.question}</span>
          </div>
          <div className="history-a">
            <span className="a-label">A</span>
            <span>{h.answer}</span>
          </div>
          <div className="history-meta">{fmt(h.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}