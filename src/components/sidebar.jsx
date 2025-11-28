import React from "react";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaHistory,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Logout',
      text: 'Apakah Anda yakin ingin keluar?',
      showCancelButton: true,
      confirmButtonColor: '#003E9C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  // ✅ Handler untuk menu Request (coming soon atau navigate)
  const handleRequestClick = () => {
    // Opsi 1: Tampilkan "Coming Soon"
    Toast.fire({
      icon: 'info',
      title: 'Coming Soon',
      text: 'Halaman Request sedang dalam pengembangan'
    });
    
    // Opsi 2: Jika sudah siap, uncomment baris berikut dan hapus Toast di atas
    // navigate("/request-history");
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r-4 border-blue-200 flex flex-col justify-between py-8 fixed left-0 top-0 h-full">
      <div>
        <div className="px-6 mb-8">
          <h1 className="text-center text-2xl font-extrabold text-[#003E9C]">
            E-Signature
          </h1>
          <p className="text-center text-xs text-gray-500 mt-1">
            Digital Signature System
          </p>
        </div>

        <nav className="px-4 space-y-2">
          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              location.pathname === "/dashboard"
                ? "bg-[#003E9C] text-white shadow-md"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/verif-log")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              location.pathname === "/verif-log"
                ? "bg-[#003E9C] text-white shadow-md"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaCheckCircle />
            <span>Verif Log</span>
          </button>

          {/* ✅ FIXED: Button Request dengan handler yang benar */}
          <button
            onClick={() => navigate("/request-history")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              location.pathname === "/request-history"
                ? "bg-[#003E9C] text-white shadow-md"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaHistory />
            <span>Request</span>
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
