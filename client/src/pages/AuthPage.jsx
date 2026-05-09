import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api.js";
import { useAuth } from "../state/useAuth.jsx";

export function AuthPage() {
  const nav = useNavigate();
  const { setSession, token } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  const passwordOk = password.length >= 8;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailOk && passwordOk && !busy;

  useEffect(() => {
    if (token) nav("/");
  }, [nav, token]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setBusy(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await apiFetch(path, { method: "POST", body: { email: email.trim(), password } });
      setSession(data.token, data.user);
      nav("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="auth-brand" aria-hidden />
        <div className="auth-head">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }} className="muted">
              Time-Block Calendar
            </div>
            <h1>{title}</h1>
          </div>

          <div className="segmented" role="tablist" aria-label="Auth mode">
            <button
              className={`btn btn-sm ${mode === "login" ? "primary" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={`btn btn-sm ${mode === "register" ? "primary" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={submit} style={{ marginTop: 22, display: "grid", gap: 14 }}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              className={`input ${email.length > 0 && !emailOk ? "input-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className={`input ${password.length > 0 && !passwordOk ? "input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error ? (
            <div className="alert alert-error" role="alert">
              <div className="alert-body">{error}</div>
            </div>
          ) : null}

          <button className="btn primary" disabled={!canSubmit} type="submit">
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            Password must be at least <strong style={{ color: "var(--text)" }}>8 characters</strong>. Use a unique password you do not reuse elsewhere.
          </p>
        </form>
      </div>
    </div>
  );
}
