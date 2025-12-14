// src/components/AdminHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function AdminHeader() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAdminData();
    
    // Close dropdown when clicking outside
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

      const response = await fetch("http://localhost:3001/admin/profile", {
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
    <header className="bg-white shadow-sm py-4 px-8 flex justify-end items-center fixed top-0 right-0 left-64 z-10">
      <div className="relative" ref={dropdownRef}>
        {/* Profile Icon Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{adminName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUserCircle className="text-2xl text-[#003E9C]" />
          </div>
        </button>

        {/* Dropdown Menu */}
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
    </header>
  );
}
