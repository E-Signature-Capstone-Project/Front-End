import { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import API_BASE_URL from "../utils/api";

// ✅ Configure SweetAlert2 dengan z-index tinggi
const Toast = Swal.mixin({
  customClass: {
    container: 'swal-container-high-z-index'
  },
  didOpen: () => {
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      swalContainer.style.zIndex = '999999';
    }
  }
});

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.username) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Toast.fire({
        icon: 'warning',
        title: 'Form Tidak Lengkap',
        text: firstError,
        confirmButtonColor: '#003E9C'
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      console.log('🚀 Sending registration request to backend...');
      console.log('Data:', {
        name: formData.username,
        email: formData.email,
        password: '***'
      });

      // ✅ AXIOS REQUEST (FIXED)
      const response = await API_BASE_URL.post("/auth/register", {
        name: formData.username, // backend expects "name"
        email: formData.email,
        password: formData.password,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response data:', response.data);

      // ✅ Registration berhasil
      setSuccessMessage('Registrasi berhasil! Mengarahkan ke halaman login...');

      Toast.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Akun Anda berhasil dibuat. Mengarahkan ke halaman login...',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false
      }).then(() => {
        navigate("/");
      });

    } catch (error) {
      console.error('❌ Registration error:', error);

      let errorTitle = 'Registrasi Gagal';
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      // ✅ AXIOS ERROR HANDLING
      if (error.response) {
        const data = error.response.data;

        if (data?.message) {
          errorMessage = data.message;

          if (data.message.toLowerCase().includes('email')) {
            setErrors({ email: data.message });
          } else {
            setErrors({ general: data.message });
          }
        }
      } else if (error.message.includes('Network')) {
        errorTitle = 'Koneksi Gagal';
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3001';
        setErrors({ general: errorMessage });
      }

      Toast.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: '#003E9C'
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <style>{`
        .swal2-container {
          z-index: 999999 !important;
        }
        .swal-container-high-z-index {
          z-index: 999999 !important;
        }
      `}</style>

      <div className="w-1/5 bg-[#003E9C] p-8 flex flex-col items-start text-white">
        <h1 className="text-3xl font-bold mb-8">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Create Your Account</h2>

          <form className="bg-white p-8 rounded-lg shadow-md space-y-4" onSubmit={handleSubmit}>

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                ✓ {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ✗ {errors.general}
              </div>
            )}

            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange} disabled={loading}
              className="w-full px-3 py-2 border rounded-lg" />

            <input type="text" name="username" placeholder="Username"
              value={formData.username} onChange={handleChange} disabled={loading}
              className="w-full px-3 py-2 border rounded-lg" />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full pr-10 px-3 py-2 border rounded-lg"
              />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full pr-10 px-3 py-2 border rounded-lg"
              />
              <button type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#003E9C] text-white py-2 rounded-lg">
              {loading ? 'Mendaftar...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account? <Link to="/" className="text-[#003E9C] font-semibold">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
