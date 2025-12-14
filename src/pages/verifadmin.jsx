// src/pages/verifadmin.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaChevronDown, FaFilePdf, FaSync, FaShieldAlt, FaFileAlt, FaUserCheck, FaUserCircle, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:3001";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// Sidebar Component
function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Logout Admin',
      text: 'Apakah Anda yakin ingin keluar dari panel admin?',
      showCancelButton: true,
      confirmButtonColor: '#003E9C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Toast.fire({ icon: 'success', title: 'Logout berhasil' });
        navigate('/adminlogin');
      }
    });
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r-4 border-blue-200 flex flex-col justify-between py-8 fixed left-0 top-0 h-full z-20">
      <div>
        <div className="px-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaShieldAlt className="text-3xl text-[#003E9C]" />
          </div>
          <h1 className="text-center text-2xl font-extrabold text-[#003E9C]">E-Signature</h1>
          <p className="text-center text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-2">
          <button
            onClick={() => navigate("/admin/verif-log")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              location.pathname === "/admin/verif-log"
                ? "bg-[#003E9C] text-white shadow-md"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaFileAlt />
            <span>Verification Log</span>
          </button>

          <button
            onClick={() => navigate("/admin/approve")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              location.pathname === "/admin/approve"
                ? "bg-[#003E9C] text-white shadow-md"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaUserCheck />
            <span>Approve Admin</span>
          </button>
        </nav>
      </div>

      <div className="px-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 font-medium py-3 px-4 rounded-lg hover:bg-red-100 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

// ✅ Profile Header Component (Lurus dengan Title)
function ProfileHeader() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAdminData();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAdminData = async () => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      if (storedAdmin) {
        const adminData = JSON.parse(storedAdmin);
        setAdminName(adminData.name || "Admin");
        return;
      }

      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminName(data.data.name || "Admin");
        localStorage.setItem("admin", JSON.stringify(data.data));
      }
    } catch (error) {
      console.error("❌ Error fetching admin:", error);
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    Swal.fire({
      icon: 'warning',
      title: 'Logout Admin',
      text: 'Apakah Anda yakin ingin keluar dari panel admin?',
      showCancelButton: true,
      confirmButtonColor: '#003E9C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Toast.fire({ icon: 'success', title: 'Logout berhasil' });
        navigate('/adminlogin');
      }
    });
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/admin/profile');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{adminName}</p>
          <p className="text-xs text-gray-500">Admin</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FaUserCircle className="text-2xl text-[#003E9C]" />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{adminName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>

          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
          >
            <FaUser className="text-gray-600" />
            <span className="text-sm text-gray-700">Profil Saya</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left border-t border-gray-200 mt-2"
          >
            <FaSignOutAlt className="text-red-600" />
            <span className="text-sm text-red-600 font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function AdminVerifLog() {
  const [loading, setLoading] = useState(true);
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAdminLogs();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [searchText, statusFilter, allLogs]);

  const fetchAdminLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}/logs/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const logs = Array.isArray(data) ? data : data.data || [];
        setAllLogs(logs);
      } else {
        setAllLogs([]);
      }
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      setAllLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let logs = [...allLogs];

    if (statusFilter !== "all") {
      logs = logs.filter(
        (log) => (log.verification_result || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    const query = searchText.trim().toLowerCase();
    if (query) {
      logs = logs.filter((log) => {
        const userName = (log.User?.name || "").toLowerCase();
        const userEmail = (log.User?.email || "").toLowerCase();
        const docTitle = (log.Document?.title || "").toLowerCase();
        return userName.includes(query) || userEmail.includes(query) || docTitle.includes(query);
      });
    }

    setFilteredLogs(logs);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "valid") {
      return { bg: "bg-green-50", text: "text-green-700", label: "Valid" };
    } else if (statusLower === "invalid") {
      return { bg: "bg-red-50", text: "text-red-700", label: "Tidak Valid" };
    }
    return { bg: "bg-gray-100", text: "text-gray-700", label: status };
  };

  return (
    <div className="flex min-h-screen bg-[#E6E6E6]">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-8">
        {/* ✅ Header dengan Title di kiri dan Profile di kanan (sejajar) */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verification Log</h1>
            <p className="text-gray-600 mt-1">Monitor semua aktivitas verifikasi tanda tangan</p>
          </div>
          <ProfileHeader />
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white rounded-lg shadow-sm px-4 py-2 flex items-center gap-2">
            <FaSearch className="text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Cari user / email / dokumen..."
              className="flex-1 outline-none text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white rounded-lg shadow-sm px-4 py-2 pr-8 text-sm font-semibold cursor-pointer outline-none hover:bg-gray-50 transition-colors"
            >
              <option value="all">Semua</option>
              <option value="valid">Valid</option>
              <option value="invalid">Tidak Valid</option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>

          <button
            onClick={fetchAdminLogs}
            className="bg-white rounded-lg shadow-sm p-2 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FaSync className="text-[#003E9C] text-sm" />
          </button>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003E9C]"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Belum ada log verifikasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => {
              const status = getStatusStyle(log.verification_result || "unknown");
              
              return (
                <div
                  key={log.log_id || index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaFilePdf className="text-[#003E9C] text-base" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {log.Document?.title || "Tanpa judul"}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">User: {log.User?.name || "-"}</p>
                      <p className="text-xs text-gray-400">{log.User?.email || "-"}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(log.timestamp)}</p>
                    </div>

                    <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
