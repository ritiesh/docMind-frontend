import { useState } from "react";
import Icon from "./Icon";
import Icons from "./Icons";
import api from "../services/api";
import "../styles/auth.css";

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setSuccess("");
  };

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "register") {
        if (!form.name) {
          setError("Name is required.");
          setLoading(false);
          return;
        }
        const r = await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        if (!r.ok) throw new Error("Registration failed. Try a different email.");
        setSuccess("Account created! Please log in.");
        setTab("login");
      } else {
        const r = await api.login({ email: form.email, password: form.password });
        if (!r.ok) throw new Error("Invalid email or password.");
        const token = await r.text();
        localStorage.setItem("token", token);
        localStorage.setItem("email", form.email);
        onLogin(token, form.email);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const keyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          Doc<span>Mind</span>
        </div>
        <div className="auth-sub">AI-powered document intelligence</div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Create account
          </button>
        </div>

        {tab === "register" && (
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              name="name"
              placeholder="Ritiesh Kumar"
              value={form.name}
              onChange={handle}
              onKeyDown={keyDown}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            name="email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={handle}
            onKeyDown={keyDown}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="form-input-wrap">
            <input
              className="form-input"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              onKeyDown={keyDown}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}>
              <Icon d={showPw ? Icons.eyeOff : Icons.eye} size={15} />
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : tab === "login" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
      </div>
    </div>
  );
}