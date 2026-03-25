import { useState } from "react";
import api from "../api";
import { setToken } from "../auth";

function Notice({ type = "error", message, onClose }) {
  if (!message) return null;
  return (
    <div className={`notice notice-${type}`}>
      <p>{message}</p>
      <button onClick={onClose} type="button" aria-label="Close notice">
        ✕
      </button>
    </div>
  );
}

export default function Login({ onLoggedIn, onGoRegister }) {
  const [email, setEmail] = useState("test@demo.com");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      onLoggedIn();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout fade-in">
      <div className="glass-card hero-card slide-up">
        <div className="auth-badge">⚡ Assessment Platform</div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-copy">
          Sign in to manage courses, lessons and publication states with a
          cleaner, faster workspace.
        </p>

        <form
          className="form-stack"
          style={{ marginTop: 24 }}
          onSubmit={handleSubmit}
        >
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <Notice type="error" message={error} onClose={() => setError("")} />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          className="row-wrap"
          style={{ justifyContent: "space-between", marginTop: 16 }}
        >
          <span className="helper-text">
            Demo user: <strong>test@demo.com</strong> /{" "}
            <strong>Test123!</strong>
          </span>
          <button
            className="btn-ghost btn-sm"
            onClick={onGoRegister}
            type="button"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
