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
import BaselineSign from "./pages/BaselinSign";
import SignatureForm from "./components/SignatureForm"; // ⬅️ baru

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />

        {/* Posisi TTD & QR */}
        <Route path="/posisi-ttd" element={<PosisiTtd />} />

        {/* Log & notifikasi */}
        <Route path="/verif-log" element={<VerifLog />} />
        <Route path="/notification" element={<Notification />} />

        {/* Flow permintaan tanda tangan */}
        <Route path="/signaturereq" element={<Signaturereq />} />
        <Route path="/request-history" element={<RequestHistory />} />

        {/* Halaman tanda tangan user */}
        <Route path="/signature" element={<SignatureForm />} />   {/* ⬅️ pakai SignatureForm */}
        <Route path="/drawsignature" element={<Drawsignature />} />
        <Route path="/uploadsignature" element={<Uploadsignature />} />
        <Route path="/completed" element={<Completed />} />

        {/* Baseline sign */}
        <Route path="/baseline-sign" element={<BaselineSign />} />
        <Route path="/baseline" element={<BaselineSign />} />
      </Routes>
    </Router>
  );
}

export default App;
