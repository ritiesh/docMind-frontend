import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Icons from "./Icons";
import api from "../services/api";
import "../styles/upload.css";

export default function UploadTab({ token, onUploaded, hasDoc }) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [docs, setDocs] = useState(
    () => JSON.parse(localStorage.getItem("docs") || "[]")
  );
  const inputRef = useRef();
  const navigate = useNavigate();

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setFile(f);
    setError("");
    setMsg("");
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const r = await api.upload(file, token);
      if (!r.ok) throw new Error();
      const text = await r.text();

      const newDoc = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        time: new Date().toLocaleString(),
      };
      const updated = [newDoc, ...docs];
      setDocs(updated);
      localStorage.setItem("docs", JSON.stringify(updated));
      setMsg(text);
      setFile(null);
      onUploaded();

      // ✅ Auto navigate to chat after 1.5 seconds
      setTimeout(() => navigate("/chat"), 1500);
    } catch {
      setError("Upload failed. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Show a welcome message for new users */}
      {!hasDoc && (
        <div className="welcome-notice">
          <div className="welcome-icon">
            <Icon d={Icons.doc} size={20} />
          </div>
          <div>
            <div className="welcome-title">Welcome! Upload your first document</div>
            <div className="welcome-sub">
              Upload a PDF and start asking questions about it instantly.
            </div>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`upload-zone ${drag ? "drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pickFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={(e) => pickFile(e.target.files[0])}
        />
        <div className="upload-icon">
          <Icon d={Icons.upload} size={22} />
        </div>
        <h3>Drop a PDF here</h3>
        <p>or click to browse your files</p>
        {file && (
          <div className="file-badge" onClick={(e) => e.stopPropagation()}>
            <Icon d={Icons.doc} size={14} /> {file.name}
          </div>
        )}
        <div className="upload-hint">Only PDF files · Max 10 MB</div>
      </div>

      {/* Upload button */}
      {file && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={upload}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Uploading...</>
          ) : (
            <><Icon d={Icons.upload} size={15} /> Upload &amp; process</>
          )}
        </button>
      )}

      {error && (
        <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>
      )}

      {msg && (
        <div className="success-msg" style={{ marginTop: 12 }}>
          <Icon d={Icons.check} size={14} /> {msg} — taking you to chat...
        </div>
      )}

      {/* Document list */}
      {docs.length > 0 && (
        <div className="doc-list">
          <div className="doc-list-label">Uploaded documents</div>
          {docs.map((d, i) => (
            <div className="doc-card" key={i}>
              <div className="doc-icon">
                <Icon d={Icons.doc} size={18} />
              </div>
              <div>
                <div className="doc-name">{d.name}</div>
                <div className="doc-meta">{d.size} · {d.time}</div>
              </div>
              <div className="doc-status">
                <Icon d={Icons.check} size={12} /> Processed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}