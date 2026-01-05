import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./auth";

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [view, setView] = useState("login"); // "login" | "register"

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, []);

  if (isAuthed) {
    return <Dashboard onLogout={() => setIsAuthed(false)} />;
  }

  if (view === "register") {
    return (
      <Register
        onRegistered={() => setIsAuthed(true)}
        onGoLogin={() => setView("login")}
      />
    );
  }

  return (
    <Login
      onLoggedIn={() => setIsAuthed(true)}
      onGoRegister={() => setView("register")}
    />
  );
}
