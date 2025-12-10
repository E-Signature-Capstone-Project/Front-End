import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import API_BASE_URL from "../utils/api";

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

function SuccessModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-center mb-4">
          Successfully
        </h2>
        <p className="text-center text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ✅ AXIOS VERSION
  const checkBaselineStatus = async () => {
    try {
      const response = await API_BASE_URL.get("/signature_baseline/");
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
    setSuccess("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login...");

      // ✅ LOGIN (AXIOS)
      const loginRes = await API_BASE_URL.post("/auth/login", {
        email,
        password,
      });

      const { token } = loginRes.data;
      if (!token) throw new Error("Token tidak ditemukan");

      localStorage.setItem("token", token);

      // ✅ FETCH PROFILE (AXIOS)
      const profileRes = await API_BASE_URL.get("/auth/profile");
      localStorage.setItem("user", JSON.stringify(profileRes.data));

      // ✅ BASELINE CHECK
      const baselineStatus = await checkBaselineStatus();

      if (baselineStatus.hasBaseline) {
        Toast.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Redirecting to Dashboard...",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/dashboard"));
      } else {
        Toast.fire({
          icon: "success",
          title: "Login Successful!",
          text: `You have ${baselineStatus.count}/5 baseline signatures`,
          confirmButtonColor: "#003E9C",
        }).then(() => navigate("/baseline"));
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
      } else if (error.message.includes("Network")) {
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
        <p className="font-semibold text-lg">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </aside>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-8">
            Please Log in
          </h2>

          <form
            className="bg-white p-8 rounded-lg shadow-md space-y-6"
            onSubmit={handleLogin}
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                className="w-full px-3 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003E9C] text-white py-2 rounded-lg"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center">
            Do not have an account?{" "}
            <Link to="/register" className="text-[#003E9C] font-semibold">
              Sign Up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
