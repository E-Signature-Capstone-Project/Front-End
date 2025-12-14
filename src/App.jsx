import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Profil from "./pages/profil";
import PosisiTtdSelf from "./pages/posisiTtdSelf";
import PosisiTtdRequest from "./pages/posisiTtdRequest";

import VerifLog from "./pages/veriflog";
import Notification from "./pages/notification";
import Signaturereq from "./components/signaturereq";
import Drawsignature from "./components/drawsignature";
import Uploadsignature from "./components/uploadsignature";
import Completed from "./components/completed";
import RequestHistory from "./pages/RequestHistory";
import BaselineSign from "./pages/BaselinSign";
import SignatureForm from "./components/SignatureForm";
import AdminLogin from "./pages/loginadmin";
import AdminVerifLog from "./pages/verifadmin";
import ApproveAdmin from "./pages/Approveadmin";
import AdminProfile from "./pages/Adminprofil";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard & Profil */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />

        {/* Posisi TTD */}
        <Route path="/posisi-ttd-self" element={<PosisiTtdSelf />} />
        <Route path="/posisi-ttd-request" element={<PosisiTtdRequest />} />

        {/* Log & Notifikasi */}
        <Route path="/verif-log" element={<VerifLog />} />
        <Route path="/notification" element={<Notification />} />

        {/* Flow Permintaan Tanda Tangan */}
        <Route path="/signaturereq" element={<Signaturereq />} />
        <Route path="/request-history" element={<RequestHistory />} />

        {/* Halaman Tanda Tangan User */}
        <Route path="/signature" element={<SignatureForm />} />
        <Route path="/drawsignature" element={<Drawsignature />} />
        <Route path="/uploadsignature" element={<Uploadsignature />} />
        <Route path="/completed" element={<Completed />} />

        {/* Baseline Sign */}
        <Route path="/baseline-sign" element={<BaselineSign />} />
        <Route path="/baseline" element={<BaselineSign />} />

        {/* Admin Routes */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admin/verif-log" element={<AdminVerifLog />} />
        <Route path="/admin/approve" element={<ApproveAdmin />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
