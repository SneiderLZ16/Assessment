import { useState } from "react";
import api from "../api";
import { setToken } from "../auth";

function Notice({ type = "info", message, onClose }) {
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

export default function Register({ onRegistered, onGoLogin }) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        name: name.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        password,
      });

      if (res?.data?.token) {
        setToken(res.data.token);
        onRegistered();
        return;
      }

      setSuccess("User created successfully. Redirecting to login...");
      setTimeout(() => onGoLogin(), 700);
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout fade-in">
      <div
        className="glass-card hero-card slide-up"
        style={{ width: "min(560px, 100%)" }}
      >
        <div className="auth-badge">✨ New account</div>
        <h1 className="auth-heading">Create your workspace</h1>
        <p className="auth-copy">
          Start building courses with a more polished experience, clearer
          actions and instant feedback.
        </p>

        <form
          className="form-stack"
          style={{ marginTop: 24 }}
          onSubmit={handleSubmit}
        >
          <div className="grid-2">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
            />
            <input
              className="input"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Last name"
            />
          </div>

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
          <Notice
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div
          className="row-wrap"
          style={{ justifyContent: "space-between", marginTop: 16 }}
        >
          <span className="helper-text">Already have an account?</span>
          <button
            className="btn-ghost btn-sm"
            onClick={onGoLogin}
            type="button"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
