import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Profil from "./pages/profil";
import PosisiTtd from "./pages/posisiTtd";
import VerifLog from "./pages/veriflog";
import Notification from "./pages/notification";
import Signaturereq from "./components/signaturereq";
import Drawsignature from "./components/drawsignature";
import Uploadsignature from "./components/uploadsignature";
import Completed from "./components/completed";
import RequestHistory from "./pages/RequestHistory"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/posisi-ttd" element={<PosisiTtd />} />
        <Route path="/verif-log" element={<VerifLog />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/signaturereq" element={<Signaturereq />} />
        <Route path="/drawsignature" element={<Drawsignature />} />
        <Route path="/uploadsignature" element={<Uploadsignature />} />
        <Route path="/completed" element={<Completed />} />
        <Route path="/request-history" element={<RequestHistory />} /> 
      </Routes>
    </Router>
  );
}

export default App;
