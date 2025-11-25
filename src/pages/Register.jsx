import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react"; 
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  // State untuk menyimpan data input
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // State untuk error, loading, dan visibilitas password
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fungsi menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hapus pesan error saat user mulai mengetik ulang
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.server) setErrors(prev => ({ ...prev, server: '' }));
  };

  // Fungsi validasi form di sisi Frontend
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi Submit ke Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true); // Mulai loading state

    try {
      // Menggunakan 127.0.0.1 agar lebih stabil di macOS
      const response = await fetch('http://127.0.0.1:5002/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Register Success:', data);
        alert("Registrasi Berhasil! Silakan Login.");
        navigate("/"); 
      } else {
        setErrors(prev => ({ ...prev, server: data.message || "Registrasi gagal" }));
      }
    } catch (error) {
      console.error('Network Error:', error);
      
      // Pesan error yang lebih membantu
      let errorMessage = "Gagal terhubung ke server.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Gagal koneksi. Pastikan Backend NYALA di port 5002 dan CORS sudah aktif.";
      }
      
      setErrors(prev => ({ ...prev, server: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Bagian Sidebar Kiri (Biru) */}
      <div className="w-1/3 bg-[#003E9C] p-8 flex flex-col items-start text-white hidden md:flex">
        <h1 className="text-3xl font-bold mb-8">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">Your Digital Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </div>

      {/* Bagian Form Kanan (Abu-abu) */}
      <div className="flex-1 flex items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Create Your Account</h2>

          <form className="bg-white p-8 rounded-lg shadow-md space-y-4" onSubmit={handleSubmit}>
            
            {/* Menampilkan Pesan Error dari Server */}
            {errors.server && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center animate-pulse">
                <strong>Error:</strong> {errors.server}
              </div>
            )}

            {/* Input Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-3 pr-3 py-2 border rounded-lg outline-none transition-colors ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#003E9C]'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Input Username */}
            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full pl-3 pr-3 py-2 border rounded-lg outline-none transition-colors ${
                  errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#003E9C]'
                }`}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            {/* Input Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-3 pr-10 py-2 border rounded-lg outline-none transition-colors ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#003E9C]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Input Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-3 pr-10 py-2 border rounded-lg outline-none transition-colors ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#003E9C]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading} // Matikan tombol saat loading
              className={`w-full text-white font-semibold py-2 rounded-lg shadow transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#003E9C] hover:bg-[#002F6C] hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
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