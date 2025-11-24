import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import BaselinSign from "./pages/BaselinSign";
import Dashboard from "./pages/dashboard";
import Profil from "./pages/profil";
import PosisiTtd from "./pages/posisiTtd";
import VerifLog from "./pages/veriflog"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/baseline" element={<BaselinSign />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/posisi-ttd" element={<PosisiTtd />} />
        <Route path="/verif-log" element={<VerifLog />} /> 
      </Routes>
    </Router>
  );
}

export default App;