import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css'

import Home from "./home/Home";
import Login from "./auth/login/login";
import Signup from "./auth/signup/signUp";
import PrivateRoute from "./components/PrivateRoute";
import BattleArena from "./pages/BattleArena";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/battle" element={<BattleArena/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
