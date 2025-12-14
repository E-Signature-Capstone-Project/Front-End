import React from "react";
import { FaShieldAlt, FaFileAlt, FaUserCheck } from "react-icons/fa";
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

export default function AdminSidebar() {
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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Toast.fire({
          icon: 'success',
          title: 'Logout berhasil'
        });
        navigate('/adminlogin');
      }
    });
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r-4 border-blue-200 flex flex-col justify-between py-8 fixed left-0 top-0 h-full">
      <div>
        <div className="px-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaShieldAlt className="text-3xl text-[#003E9C]" />
          </div>
          <h1 className="text-center text-2xl font-extrabold text-[#003E9C]">
            E-Signature
          </h1>
          <p className="text-center text-xs text-gray-500 mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="px-4 space-y-2">
          {/* ✅ Path: /admin/verif-log */}
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

          {/* ✅ Path: /admin/approve */}
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
