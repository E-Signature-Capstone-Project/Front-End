import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Profil from "./pages/profil";
import Ttd from "./pages/ttd";
import PosisiTtd from "./pages/posisiTtd";
import VerifLog from "./pages/veriflog"; // ✅ path diperbaiki

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/ttd" element={<Ttd />} />
        <Route path="/posisi-ttd" element={<PosisiTtd />} />
        <Route path="/verif-log" element={<VerifLog />} /> {/* ✅ huruf besar */}
      </Routes>
    </Router>
  );
}

export default App;
