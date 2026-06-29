import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import ChatScreen from "./components/ChatScreen";
import DashboardScreen from "./components/DashboardScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("onboardbot_session");
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user) => {
    localStorage.setItem("onboardbot_session", JSON.stringify(user));
    setCurrentUser(user);
  };

  useEffect(() => {
    // Check if there is an active session in local storage
    const savedSession = localStorage.getItem("onboardbot_session");
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error("Failed to parse saved session:", e);
      }
    }
    setIsCheckingSession(false);
  }, []);

  if (isCheckingSession) {
    return (
      <div className="bg-[#031427] min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* If not logged in, all routes redirect to /login */}
        <Route
          path="/login"
          element={
            currentUser ? (
              currentUser.role === "hr" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/chat" replace />
              )
            ) : (
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/chat"
          element={
            currentUser ? (
              <ChatScreen user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            currentUser ? (
              currentUser.role === "hr" ? (
                <DashboardScreen user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/chat" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            currentUser ? (
              currentUser.role === "hr" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/chat" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
