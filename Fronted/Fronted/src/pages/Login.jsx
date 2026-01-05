import { useState } from "react";
import api from "../api";
import { setToken } from "../auth";

export default function Login({ onLoggedIn, onGoRegister }) {
  const [email, setEmail] = useState("test@demo.com");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      onLoggedIn();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Login</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button style={styles.button} type="submit">
            Sign in
          </button>

          {error && <div style={styles.error}>{error}</div>}
        </form>

        <button style={styles.linkBtn} onClick={onGoRegister} type="button">
          Create account
        </button>

        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Seed: <b>test@demo.com</b> / <b>Test123!</b>
        </p>
      </div>
    </div>
  );
}

const styles = {
  center: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0b1220",
    color: "#e6eefc",
    padding: 20,
  },
  card: {
    width: "min(420px, 100%)",
    background: "#121a2b",
    border: "1px solid #25324a",
    borderRadius: 12,
    padding: 16,
  },
  input: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #25324a",
    background: "#0f1726",
    color: "#e6eefc",
    outline: "none",
  },
  button: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #2c3f66",
    background: "#1e2b44",
    color: "#e6eefc",
    cursor: "pointer",
  },
  linkBtn: {
    marginTop: 10,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #25324a",
    background: "transparent",
    color: "#a9c2ff",
    cursor: "pointer",
  },
  error: {
    padding: 10,
    borderRadius: 10,
    background: "#2b1620",
    border: "1px solid #6b2b3c",
    color: "#ffd1dc",
  },
};
