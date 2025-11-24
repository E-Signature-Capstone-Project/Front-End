import { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

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
    
    // ✅ Tampilkan SweetAlert jika ada error validasi
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
    
    // Validasi form dulu
    if (!validateForm()) {
      return;
    }

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

      // Panggil API Backend untuk Register
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username,  // Backend expect "name", not "username"
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        // Jika ada error dari backend
        console.error('❌ Registration failed:', data);
        
        let errorTitle = 'Registrasi Gagal';
        let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        
        if (data.message) {
          // Cek jenis error
          if (data.message.toLowerCase().includes('email')) {
            errorTitle = 'Email Tidak Valid';
            errorMessage = data.message;
            setErrors({ email: data.message });
          } else if (data.message.toLowerCase().includes('exist') || 
                     data.message.toLowerCase().includes('already') ||
                     data.message.toLowerCase().includes('sudah')) {
            errorTitle = 'Email Sudah Terdaftar';
            errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.';
            setErrors({ email: 'Email sudah terdaftar' });
          } else {
            errorMessage = data.message;
            setErrors({ general: data.message });
          }
        } else {
          setErrors({ general: 'Registrasi gagal. Silakan coba lagi.' });
        }

        // ✅ Tampilkan error dengan SweetAlert
        Toast.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#003E9C'
        });
        
        return;
      }

      // ✅ Registration berhasil
      console.log('✅ Registration successful!');
      setSuccessMessage('Registrasi berhasil! Mengarahkan ke halaman login...');
      
      // ✅ Tampilkan success dengan SweetAlert
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
      console.error('❌ Network error:', error);
      
      let errorTitle = 'Koneksi Gagal';
      let errorMessage = '';
      
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di port 3001.';
        setErrors({ 
          general: 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3001' 
        });
      } else {
        errorTitle = 'Terjadi Kesalahan';
        errorMessage = 'Terjadi kesalahan. Silakan coba lagi nanti.';
        setErrors({ 
          general: 'Terjadi kesalahan. Silakan coba lagi nanti.' 
        });
      }

      // ✅ Tampilkan network error dengan SweetAlert
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
      {/* Global Style untuk SweetAlert2 z-index */}
      <style>{`
        .swal2-container {
          z-index: 999999 !important;
        }
        .swal-container-high-z-index {
          z-index: 999999 !important;
        }
      `}</style>

      {/* Sidebar */}
      <div className="w-1/5 bg-[#003E9C] p-8 flex flex-col items-start text-white">
        <h1 className="text-3xl font-bold mb-8">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Create Your Account</h2>

          <form className="bg-white p-8 rounded-lg shadow-md space-y-4" onSubmit={handleSubmit}>
            
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                ✓ {successMessage}
                <button 
                  onClick={() => setSuccessMessage('')}
                  className="absolute top-2 right-2 text-green-700 hover:text-green-900"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                ✗ {errors.general}
                <button 
                  onClick={() => setErrors(prev => ({ ...prev, general: '' }))}
                  className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#003E9C] focus:ring-1 focus:ring-[#003E9C] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#003E9C] focus:ring-1 focus:ring-[#003E9C] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#003E9C] focus:ring-1 focus:ring-[#003E9C] disabled:bg-gray-100 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 z-10"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#003E9C] focus:ring-1 focus:ring-[#003E9C] disabled:bg-gray-100 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                style={{ WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 z-10"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#003E9C] text-white font-semibold px-8 py-2 rounded-lg shadow hover:bg-[#002F6C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mendaftar...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-900 mt-4">
            Already have an account?{' '}
            <Link to="/" className="font-semibold hover:underline text-[#003E9C]">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}