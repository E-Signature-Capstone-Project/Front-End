import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Profil from "./pages/profil";
import Ttd from "./pages/ttd";
import PosisiTtd from "./pages/posisiTtd";
import VerifLog from "./pages/veriflog"; 
import Notification from "./pages/notification";
import Signaturereq from "./components/signaturereq";
import Drawsignature from "./components/drawsignature";
import Uploadsignature from "./components/uploadsignature";
import Completed from "./components/completed";

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
        <Route path="/notification" element={<Notification />} />
        <Route path="/signaturereq" element={<Signaturereq />} />
        <Route path="/drawsignature" element={<Drawsignature />} />
        <Route path="/uploadsignature" element={<Uploadsignature />} />
        <Route path="/completed" element={<Completed />} />
      </Routes>
    </Router>
  );
}

export default App;
