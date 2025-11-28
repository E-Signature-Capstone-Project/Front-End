import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 8.586L3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z" />
          </svg>
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center animate-scale-in">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-green-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
                className="animate-draw-check"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
          Successfully
        </h2>

        <p className="text-center text-gray-600 leading-relaxed whitespace-pre-line">
          {message}
        </p>
      </div>

      <style>{`
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes draw-check {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-draw-check {
          animation: draw-check 0.5s ease-out 0.2s forwards;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
        }
      `}</style>
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:3001";

  const checkBaselineStatus = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signature_baseline/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("ℹ️ User belum punya baseline");
          return { hasBaseline: false, count: 0 };
        }
        throw new Error("Failed to check baseline status");
      }

      const data = await response.json();
      console.log("📊 Baseline status:", data);

      const count = data.count || 0;
      const hasCompleteBaseline = count >= 5;

      return {
        hasBaseline: hasCompleteBaseline,
        count: count,
      };
    } catch (error) {
      console.error("❌ Error checking baseline:", error);
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
        confirmButtonText: "OK",
      });
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login...");
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("✅ Login successful:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        throw new Error("Token tidak ditemukan dari server");
      }

      // 🔴 PENTING: simpan user + log
      if (data.user) {
        console.log("✅ User dari backend:", data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log(
          "✅ User disimpan ke localStorage:",
          localStorage.getItem("user")
        );
      }

      console.log("📊 Checking baseline status...");
      const baselineStatus = await checkBaselineStatus(data.token);

      if (baselineStatus.hasBaseline) {
        console.log(
          "✅ User has complete baseline → redirecting to Dashboard"
        );

        Toast.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Welcome back! Redirecting to Dashboard...",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
        }).then(() => {
          navigate("/dashboard");
        });
      } else {
        console.log(
          `⚠️ User has ${baselineStatus.count}/5 baseline → redirecting to Baseline Sign`
        );

        let message = "";
        if (baselineStatus.count > 0) {
          message = `You have ${baselineStatus.count}/5 baseline signatures. Please complete your baseline setup.`;
        } else {
          message =
            "Please set up your baseline signatures to continue using the system.";
        }

        Toast.fire({
          icon: "success",
          title: "Login Successful!",
          text: message,
          confirmButtonColor: "#003E9C",
          confirmButtonText: "Setup Baseline",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/baseline");
          }
        });

        setSuccess(
          "Login successful! Please complete your baseline signatures."
        );
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "";
      let errorTitle = "Login Failed";

      if (
        error.message.includes("401") ||
        error.message.includes("invalid") ||
        error.message.includes("incorrect")
      ) {
        errorTitle = "Invalid Credentials";
        errorMessage =
          "Email or password is incorrect. Please try again.";
        setError("Email atau password salah");
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch")
      ) {
        errorTitle = "Connection Error";
        errorMessage =
          "Cannot connect to server. Make sure backend is running on port 3001.";
        setError("Gagal terhubung ke server. Coba lagi nanti.");
      } else if (error.message.includes("Token")) {
        errorTitle = "Authentication Error";
        errorMessage = "Invalid token received from server.";
        setError("Login gagal: Token tidak valid");
      } else {
        errorMessage =
          error.message || "An error occurred during login. Please try again.";
        setError(error.message || "Login gagal. Silakan coba lagi.");
      }

      Toast.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: "#003E9C",
        confirmButtonText: "Try Again",
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      {/* Sidebar */}
      <aside className="w-1/5 bg-[#003E9C] flex flex-col items-start py-8 px-8 text-white">
        <h1 className="text-3xl font-bold mb-4">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </aside>

      {/* Main Section */}
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

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                {success}
                <button
                  onClick={() => setSuccess("")}
                  className="absolute top-2 right-2 text-green-700 hover:text-green-900"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {loading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">🔄 Memproses login...</p>
                <p className="text-xs mt-1">Mohon tunggu sebentar</p>
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
                  setSuccess("");
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
                  setSuccess("");
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

          <p className="mt-6 text-sm text-gray-900 text-center">
            Do not have an account?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline text-[#003E9C]"
            >
              Sign Up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
