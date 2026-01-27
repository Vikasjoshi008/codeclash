import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./auth/login/login";
import Signup from "./auth/signup/signUp";
import PrivateRoute from "./components/PrivateRoute";
import Landing from "./pages/Landing";
import Practice from "./pages/Practice";
import OneVsOne from "./pages/OneVsOne";
import Question from "./pages/Question";
import Navbar from "./components/Navbar";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* private routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/battle/1v1"
            element={
              <PrivateRoute>
                <OneVsOne />
              </PrivateRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <PrivateRoute>
                <Practice />
              </PrivateRoute>
            }
          />
          <Route
            path="/practice/:difficulty/:order"
            element={
              <PrivateRoute>
                <Question />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
