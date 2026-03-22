import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import Icons from "./Icons";
import api from "../services/api";
import "../styles/chat.css";

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

        // Sub bullets starting with spaces + -
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

        // Empty line = spacer
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

// Handle inline **bold** and *italic* formatting
function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

// ── ChatTab ───────────────────────────────────────────────────────────────
export default function ChatTab({ token, email, hasDoc }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! Upload a document and ask me anything about it.",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((m) => [...m, { role: "user", text: q, time: new Date() }]);
    setLoading(true);

    try {
      const r = await api.ask(q, token);
      const data = await r.json();
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: data.answer || "Sorry, I couldn't get a response.",
          time: new Date(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Something went wrong. Please try again.",
          time: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  const keyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const fmt = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const initials = email ? email[0].toUpperCase() : "U";

  return (
    <div className="chat-wrap">
      {!hasDoc && (
        <div className="no-doc-notice">
          <Icon d={Icons.doc} size={15} />
          No document uploaded yet — go to the{" "}
          <strong style={{ margin: "0 4px" }}>Documents</strong> tab to upload
          a PDF first.
        </div>
      )}

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-avatar">
              {m.role === "user" ? initials : "✦"}
            </div>
            <div>
              <div className="msg-bubble">
                {m.role === "ai" ? (
                  <FormattedAnswer text={m.text} />
                ) : (
                  m.text
                )}
              </div>
              <div className="msg-time">{fmt(m.time)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg ai">
            <div className="msg-avatar">✦</div>
            <div className="msg-bubble ai-bubble">
              <div className="typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything about your document…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={keyDown}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={send}
            disabled={!input.trim() || loading}
          >
            <Icon d={Icons.send} size={15} />
          </button>
        </div>
        <div className="chat-hint">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}