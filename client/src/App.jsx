import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css'

import Home from "./home/Home";
import Login from "./auth/login/login";
import Signup from "./auth/signup/signUp";
import PrivateRoute from "./components/PrivateRoute";
import BattleArena from "./pages/BattleArena";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import OneVsOne from "./pages/OneVsOne";
import AIPractice from './pages/AiPractice';
import Question from './pages/Question';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" 
              element={ 
                <PrivateRoute>
                  <Dashboard/>
                </PrivateRoute>} />
        <Route path="/battle/1v1"
              element={
                <PrivateRoute>
                  <OneVsOne />
                </PrivateRoute> }/>
                <Route
                  path="/practice"
                  element={
                    <PrivateRoute>
                      <Practice />
                    </PrivateRoute>
                  } />
                  <Route 
                  path='/practice/:level'
                  element={
                    <PrivateRoute>
                      <AIPractice/>
                    </PrivateRoute>
                  }/>
                  <Route 
                  path='/practice/:difficulty/:order'
                  element={
                    <PrivateRoute>
                      <Question />
                    </PrivateRoute>
                  }
                  />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
