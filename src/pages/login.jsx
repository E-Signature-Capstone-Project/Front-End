import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const Toast = Swal.mixin({
  customClass: {
    container: "swal-container-high-z-index",
  },
  didOpen: () => {
    const swalContainer = document.querySelector(".swal2-container");
    if (swalContainer) {
      swalContainer.style.zIndex = "999999";
    }
  },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const checkBaselineStatus = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/signature_baseline/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const count = response.data?.count || 0;

      return {
        hasBaseline: count >= 5,
        count,
      };
    } catch (err) {
      console.warn("⚠️ Baseline check failed (assume not exist)");
      return { hasBaseline: false, count: 0 };
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email dan password harus diisi");
      Toast.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill in email and password",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login...");

      // ✅ Login
      const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token } = loginRes.data;
      if (!token) throw new Error("Token tidak ditemukan");

      localStorage.setItem("token", token);

      // ✅ Fetch Profile
      const profileRes = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = profileRes.data;
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("👤 User data:", userData);

      // ✅ CEK ROLE - Redirect sesuai role
      if (userData.role === "admin") {
        // 🔹 Admin → Langsung ke halaman VerifAdmin
        Toast.fire({
          icon: "success",
          title: "Admin Login Successful!",
          text: "Redirecting to Admin Panel...",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => navigate("/admin/verif-log")); // ✅ Ganti dengan route halaman admin kamu

      } else {
        // 🔹 User biasa → Cek baseline dulu
        const baselineStatus = await checkBaselineStatus(token);

        if (baselineStatus.hasBaseline) {
          Toast.fire({
            icon: "success",
            title: "Login Successful!",
            text: "Redirecting to Dashboard...",
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }).then(() => navigate("/dashboard"));
        } else {
          Toast.fire({
            icon: "success",
            title: "Login Successful!",
            html: `<p>You have <strong>${baselineStatus.count}/5</strong> baseline signatures</p><p class="text-sm text-gray-600 mt-2">Please complete your baseline setup</p>`,
            confirmButtonColor: "#003E9C",
            confirmButtonText: "Setup Baseline",
          }).then(() => navigate("/baseline"));
        }
      }

    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login gagal. Silakan coba lagi.";
      let errorTitle = "Login Failed";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;

        if (error.response.status === 401) {
          errorTitle = "Invalid Credentials";
          errorMessage = "Email atau password salah";
        }
      } else if (error.message.includes("Network") || error.code === "ERR_NETWORK") {
        errorTitle = "Connection Error";
        errorMessage =
          "Tidak dapat terhubung ke server. Pastikan backend berjalan di port 3001.";
      }

      setError(errorMessage);

      Toast.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: "#003E9C",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <style>{`
        .swal2-container { z-index: 999999 !important; }
        .swal-container-high-z-index { z-index: 999999 !important; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-1/5 bg-[#003E9C] flex flex-col items-start py-8 px-8 text-white">
        <h1 className="text-3xl font-bold mb-4">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </aside>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Please Log in
          </h2>

          <form
            className="bg-white p-8 rounded-lg shadow-md space-y-6"
            onSubmit={handleLogin}
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
                <button
                  onClick={() => setError("")}
                  className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {loading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">🔄 Logging in...</p>
                <p className="text-xs mt-1">Please wait</p>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#003E9C] focus:ring-1 focus:ring-[#003E9C] disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
                required
              />
            </div>

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#003E9C] focus:ring-1 focus:ring-[#003E9C] disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-gray-700 hover:underline">
                Forgot Password ?
              </a>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#003E9C] text-white px-8 py-2 rounded-md font-medium shadow hover:bg-[#002F6C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-900">
              Do not have an account?{" "}
              <Link to="/register" className="font-semibold hover:underline text-[#003E9C]">
                Sign Up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
