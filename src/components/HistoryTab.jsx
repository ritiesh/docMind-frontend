import { useState, useEffect } from "react";
import Icon from "./Icon";
import Icons from "./Icons";
import api from "../services/api";
import "../styles/history.css";

// ── Format AI answer text into styled HTML ────────────────────────────────
function FormattedAnswer({ text }) {
  const lines = text.split("\n");

  return (
    <div className="formatted-answer">
      {lines.map((line, i) => {
        // Bold headers like **Skills mentioned:**
        if (/^\*\*(.+)\*\*$/.test(line.trim())) {
          return (
            <p key={i} className="answer-heading">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }

        // Bullet points starting with - or •
        if (/^[-•]\s+/.test(line.trim())) {
          const content = line.replace(/^[-•]\s+/, "").trim();
          return (
            <div key={i} className="answer-bullet">
              <span className="bullet-dot" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }

        // Sub bullets
        if (/^\s{2,}[-•]\s+/.test(line)) {
          const content = line.replace(/^\s+[-•]\s+/, "").trim();
          return (
            <div key={i} className="answer-sub-bullet">
              <span className="bullet-dot small" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s+/.test(line.trim())) {
          const num = line.match(/^(\d+)\./)[1];
          const content = line.replace(/^\d+\.\s+/, "").trim();
          return (
            <div key={i} className="answer-numbered">
              <span className="answer-num">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }

        // Empty line
        if (line.trim() === "") {
          return <div key={i} className="answer-spacer" />;
        }

        // Normal paragraph
        return (
          <p
            key={i}
            className="answer-para"
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      })}
    </div>
  );
}

// Handle inline **bold** and *italic*
function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

// ── HistoryTab ─────────────────────────────────────────────────────────────
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
    return <div className="history-loading">Loading history…</div>;
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
            <div style={{ flex: 1 }}>
              <FormattedAnswer text={h.answer} />
            </div>
          </div>
          <div className="history-meta">{fmt(h.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}