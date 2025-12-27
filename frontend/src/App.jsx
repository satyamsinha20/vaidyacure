import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Herbs from "./pages/Herbs";   // ✅ correct page
import Homeopathy from "./pages/Homeopathy";

function App() {
  const [user, setUser] = useState(
    localStorage.getItem("name") || null
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Herbs Page */}
        <Route
          path="/dashboard/herbs"
          element={user ? <Herbs /> : <Navigate to="/" />}
        />
        {/* Homeopathy Page */}
        <Route
          path="/dashboard/homeopathy"
          element={user ? <Homeopathy /> : <Navigate to="/" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;