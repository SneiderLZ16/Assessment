import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./auth";
import "./App.css";

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [view, setView] = useState("login");

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, []);

  if (isAuthed) {
    return <Dashboard onLogout={() => setIsAuthed(false)} />;
  }

  return view === "register" ? (
    <Register
      onRegistered={() => setIsAuthed(true)}
      onGoLogin={() => setView("login")}
    />
  ) : (
    <Login
      onLoggedIn={() => setIsAuthed(true)}
      onGoRegister={() => setView("register")}
    />
  );
}
