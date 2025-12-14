// src/pages/Approveadmin.jsx
import { useEffect, useState, useRef } from "react";
import { FaSearch, FaUserCheck, FaSync, FaUserCircle, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminSidebar from "../components/AdminSidebar";

const API_BASE = "http://localhost:3001";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// ✅ Profile Header Component
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

export default function ApproveAdmin() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/admin/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data || []);
      } else {
        console.error("Failed to fetch admins");
        setAdmins([]);
      }
    } catch (err) {
      console.error("❌ Error fetching admins:", err);
      Toast.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: 'Tidak dapat terhubung ke server'
      });
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const approveAdmin = async (userId, adminName) => {
    const result = await Swal.fire({
      title: 'Setujui Admin?',
      html: `Apakah Anda yakin ingin menyetujui <strong>${adminName}</strong> sebagai admin?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#003E9C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/admin/approve/${userId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Toast.fire({
            icon: 'success',
            title: 'Berhasil',
            text: `${adminName} telah disetujui sebagai admin`
          });
          fetchAdmins();
        } else {
          const data = await response.json();
          Toast.fire({
            icon: 'error',
            title: 'Gagal menyetujui',
            text: data.message || 'Terjadi kesalahan'
          });
        }
      } catch (err) {
        console.error("❌ Error approving admin:", err);
        Toast.fire({
          icon: 'error',
          title: 'Gagal menyetujui',
          text: 'Tidak dapat terhubung ke server'
        });
      }
    }
  };

  const rejectAdmin = async (userId, adminName) => {
    const result = await Swal.fire({
      title: 'Tolak Admin?',
      html: `Apakah Anda yakin ingin menolak <strong>${adminName}</strong>?<br/><small>Akun ini akan dihapus.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/admin/reject/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Toast.fire({
            icon: 'success',
            title: 'Ditolak',
            text: `Permintaan ${adminName} telah ditolak`
          });
          fetchAdmins();
        } else {
          const data = await response.json();
          Toast.fire({
            icon: 'error',
            title: 'Gagal menolak',
            text: data.message || 'Terjadi kesalahan'
          });
        }
      } catch (err) {
        console.error("❌ Error rejecting admin:", err);
        Toast.fire({
          icon: 'error',
          title: 'Gagal menolak',
          text: 'Tidak dapat terhubung ke server'
        });
      }
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#E6E6E6]">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-8">
        {/* ✅ Header dengan Title di kiri dan Profile di kanan (sejajar) */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approve Admin</h1>
            <p className="text-gray-600 mt-1">Kelola permintaan akses admin baru</p>
          </div>
          <ProfileHeader />
        </div>

        {/* Search & Refresh */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white rounded-lg shadow-sm px-4 py-2 flex items-center gap-2">
            <FaSearch className="text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Cari nama / email admin..."
              className="flex-1 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={fetchAdmins}
            className="bg-white rounded-lg shadow-sm p-2 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FaSync className="text-[#003E9C] text-sm" />
          </button>
        </div>

        {/* Admin List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003E9C]"></div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FaUserCheck className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {search ? "Tidak ada admin yang cocok dengan pencarian" : "Tidak ada admin menunggu persetujuan"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.user_id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUserCheck className="text-[#003E9C] text-lg" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{admin.name}</h3>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Daftar: {new Date(admin.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-yellow-50 text-yellow-600 text-xs px-3 py-1 rounded-full font-semibold">
                      Menunggu
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => rejectAdmin(admin.user_id, admin.name)}
                    className="border border-red-400 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => approveAdmin(admin.user_id, admin.name)}
                    className="bg-[#003E9C] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                  >
                    Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
