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

  useEffect(() => {
    if (token) nav("/");
  }, [nav, token]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await apiFetch(path, { method: "POST", body: { email, password } });
      setSession(data.token, data.user);
      nav("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 0.4 }} className="muted">
              Time-Block Calendar
            </div>
            <h2 style={{ margin: "6px 0 0" }}>{title}</h2>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn ${mode === "login" ? "primary" : ""}`}
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`btn ${mode === "register" ? "primary" : ""}`}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={submit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div className="field">
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error ? (
            <div style={{ border: "1px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.12)", padding: 10, borderRadius: 10 }}>
              {error}
            </div>
          ) : null}

          <button className="btn primary" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
          </button>

          <div className="muted" style={{ fontSize: 12 }}>
            Password must be at least 8 characters (backend rule).
          </div>
        </form>
      </div>
    </div>
  );
}

