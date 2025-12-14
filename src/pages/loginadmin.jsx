// src/pages/loginadmin.jsx
import { useState } from 'react';
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import API_BASE_URL from "../utils/api";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      Toast.fire({
        icon: 'warning',
        title: 'Email dan password wajib diisi'
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🚀 Admin login attempt...');
      
      const response = await API_BASE_URL.post("/auth/login", formData);

      if (response.data.success) {
        const { token, user } = response.data;

        // ✅ Validasi role admin
        if (user.role !== 'admin') {
          Toast.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Anda bukan admin. Gunakan login user biasa.'
          });
          return;
        }

        // ✅ Cek approval
        if (!user.is_approved) {
          Swal.fire({
            icon: 'warning',
            title: 'Menunggu Persetujuan',
            html: `
              <p class="text-gray-700 mb-2">Akun admin Anda belum disetujui.</p>
              <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-3 my-3">
                <p class="text-sm text-yellow-800">Silakan tunggu persetujuan dari admin lain.</p>
              </div>
            `,
            confirmButtonColor: '#003E9C'
          });
          return;
        }

        // ✅ Simpan token dan data admin
        localStorage.setItem('adminToken', token);
        localStorage.setItem('token', token);
        localStorage.setItem('admin', JSON.stringify(user));

        Toast.fire({
          icon: 'success',
          title: `Selamat datang, ${user.name}!`
        });

        navigate('/admin/verif-log');
      }

    } catch (error) {
      console.error('❌ Login error:', error);

      let errorMessage = 'Terjadi kesalahan saat login';

      if (error.response) {
        const data = error.response.data;
        
        if (data.status === 'pending_approval') {
          Swal.fire({
            icon: 'warning',
            title: 'Menunggu Persetujuan',
            text: data.message,
            confirmButtonColor: '#003E9C'
          });
          return;
        }

        errorMessage = data.message || errorMessage;
      } else if (error.message.includes('Network')) {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      Toast.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMessage
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="w-1/5 bg-[#003E9C] p-8 flex flex-col items-start text-white">
        <div className="flex items-center gap-2 mb-4">
          <FaShieldAlt className="text-3xl" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Secure Admin Access</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-sm text-gray-600 mt-2">Masuk ke panel administrator</p>
          </div>

          <form className="bg-white p-8 rounded-lg shadow-md space-y-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C] transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003E9C] text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Logging in...
                </span>
              ) : (
                'Login as Admin'
              )}
            </button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <FaShieldAlt className="text-[#003E9C] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-700">
                  <p className="font-semibold mb-1">Akses Admin</p>
                  <p>Hanya untuk pengguna dengan hak akses administrator yang telah disetujui.</p>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-gray-600 text-sm">
              Belum punya akun admin?{' '}
              <Link to="/register" className="text-[#003E9C] font-semibold hover:underline">
                Request Access
              </Link>
            </p>

            <p className="text-gray-500 text-sm">
              User biasa?{' '}
              <Link to="/login" className="text-[#003E9C] font-semibold hover:underline">
                User Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
