import { useState } from "react";
import api from "../api";
import { setToken } from "../auth";

export default function Register({ onRegistered, onGoLogin }) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

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

      
      setSuccess("User created. Please login.");
      setTimeout(() => onGoLogin(), 700);
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    }
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Register</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <div style={styles.row}>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              style={styles.input}
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Lastname"
            />
          </div>

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
            Create account
          </button>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
        </form>

        <button style={styles.linkBtn} onClick={onGoLogin} type="button">
          Already have an account? Login
        </button>
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
    width: "min(460px, 100%)",
    background: "#121a2b",
    border: "1px solid #25324a",
    borderRadius: 12,
    padding: 16,
  },
  row: { display: "flex", gap: 8 },
  input: {
    flex: 1,
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
  success: {
    padding: 10,
    borderRadius: 10,
    background: "#122b1c",
    border: "1px solid #2b6b3c",
    color: "#d1ffe0",
  },
};
