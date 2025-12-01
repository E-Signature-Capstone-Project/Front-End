import React, { useRef, useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaExchangeAlt,
  FaPaintBrush,
  FaUpload,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:3001";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const canvasRef = useRef(null);

  const [baselines, setBaselines] = useState([]);
  const [loadingBaselines, setLoadingBaselines] = useState(true);
  const [replaceId, setReplaceId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUser({
            name: data.name,
            email: data.email,
          });
        }
      })
      .catch(() => console.log("Gagal ambil data user"));
  }, [navigate]);

  // ✅ Fetch baseline signatures dari backend
  useEffect(() => {
    fetchBaselines();
  }, []);

  const fetchBaselines = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/signature_baseline/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Baselines fetched:", data);
        setBaselines(data.baselines || []);
      } else if (response.status === 404) {
        console.log("ℹ️ Belum ada baseline");
        setBaselines([]);
      }
    } catch (error) {
      console.error("❌ Error fetching baselines:", error);
      setBaselines([]);
    } finally {
      setLoadingBaselines(false);
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#003E9C",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    });
  };

  // ✅ Upload baseline baru
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (baselines.length >= 5) {
      Swal.fire({
        icon: "warning",
        title: "Maksimal 5 Baseline",
        text: "Anda sudah mencapai maksimal 5 baseline signature.",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/signature_baseline/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Tampilkan error dari backend (AI validation)
        const errorMessage = data.message || data.error || "Gagal menambah baseline";
        const suggestion = data.details?.suggestion || "";

        let errorHtml = `<p class="mb-2">${errorMessage}</p>`;
        if (suggestion) {
          errorHtml += `
            <div class="bg-blue-50 p-3 rounded text-sm text-left mt-3">
              <p class="font-semibold text-blue-900 mb-1">💡 Saran:</p>
              <p class="text-blue-700">${suggestion}</p>
            </div>
          `;
        }

        Swal.fire({
          icon: "error",
          title: "Gagal Menambah Baseline",
          html: errorHtml,
          confirmButtonColor: "#003E9C",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Baseline Berhasil Ditambahkan!",
        text: `Baseline ${baselines.length + 1}/5 berhasil disimpan`,
        confirmButtonColor: "#003E9C",
        timer: 2000,
      });

      // Refresh baseline list
      fetchBaselines();
      setShowOptions(false);
    } catch (error) {
      console.error("❌ Upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Upload",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    }
  };

  // ✅ Replace baseline dengan yang baru
  const handleReplaceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || replaceId === null) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/signature_baseline/${replaceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal replace baseline");
      }

      Swal.fire({
        icon: "success",
        title: "Baseline Berhasil Diupdate!",
        confirmButtonColor: "#003E9C",
        timer: 2000,
      });

      // Refresh baseline list
      fetchBaselines();
      setReplaceId(null);
    } catch (error) {
      console.error("❌ Replace error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Update Baseline",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    }
  };

  // ✅ Delete baseline
  const handleDeleteBaseline = async (baselineId) => {
    const result = await Swal.fire({
      title: "Hapus Baseline?",
      text: "Baseline yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/signature_baseline/${baselineId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus baseline");
      }

      Swal.fire({
        icon: "success",
        title: "Baseline Dihapus!",
        confirmButtonColor: "#003E9C",
        timer: 1500,
      });

      // Refresh baseline list
      fetchBaselines();
    } catch (error) {
      console.error("❌ Delete error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    }
  };

  // Drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#003E9C";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  // ✅ Save drawing sebagai baseline baru
  const handleSaveDrawing = async () => {
    if (baselines.length >= 5) {
      Swal.fire({
        icon: "warning",
        title: "Maksimal 5 Baseline",
        text: "Anda sudah mencapai maksimal 5 baseline signature.",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, `signature_${Date.now()}.png`);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/signature_baseline/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.message || data.error || "Gagal menambah baseline";
          const suggestion = data.details?.suggestion || "";

          let errorHtml = `<p class="mb-2">${errorMessage}</p>`;
          if (suggestion) {
            errorHtml += `
              <div class="bg-blue-50 p-3 rounded text-sm text-left mt-3">
                <p class="font-semibold text-blue-900 mb-1">💡 Saran:</p>
                <p class="text-blue-700">${suggestion}</p>
              </div>
            `;
          }

          Swal.fire({
            icon: "error",
            title: "Gagal Menambah Baseline",
            html: errorHtml,
            confirmButtonColor: "#003E9C",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Baseline Berhasil Ditambahkan!",
          text: `Baseline ${baselines.length + 1}/5 berhasil disimpan`,
          confirmButtonColor: "#003E9C",
          timer: 2000,
        });

        // Refresh baseline list
        fetchBaselines();
        setIsDrawingMode(false);
        handleClearCanvas();
      } catch (error) {
        console.error("❌ Save drawing error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: error.message,
          confirmButtonColor: "#003E9C",
        });
      }
    });
  };

  const handleClearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col md:flex-row font-sans">
      {/* LEFT PROFILE PANEL */}
      <div className="w-full md:w-[260px] bg-white md:h-screen shadow-md border-b md:border-r border-gray-200 p-6 flex md:flex-col flex-row md:items-center items-start gap-4 sticky top-0">
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-200 flex items-center justify-center">
          <svg
            className="h-10 w-10 md:h-14 md:w-14 text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.67 0 8 1.34 8 4v4H4v-4c0-2.66 5.33-4 8-4z" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="flex flex-col w-full">
          <h2 className="text-lg font-semibold">{user.name || "Loading..."}</h2>
          <p className="text-gray-500 text-sm mb-4">{user.email || "-"}</p>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-full mb-3 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 text-base"
          >
            <FaArrowLeft size={18} /> Back
          </button>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-[#003E9C] hover:bg-[#002A6B] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-3 text-base"
          >
            <FaExchangeAlt size={18} /> Log out
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-semibold mb-6">Signature Baseline</h1>

        <div className="bg-white p-6 shadow rounded-xl border border-gray-200">
          {/* Loading State */}
          {loadingBaselines ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading baselines...</p>
            </div>
          ) : (
            <>
              {/* Baseline Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {baselines.map((baseline, index) => (
                  <div
                    key={baseline.baseline_id}
                    className="relative aspect-square w-full max-w-[150px] border-2 border-green-500 rounded-lg shadow-sm bg-white flex items-center justify-center group"
                  >
                    <img
                      src={`${API_BASE}/${baseline.sign_image}`}
                      alt={`Baseline ${index + 1}`}
                      className="max-w-full max-h-full object-contain p-2"
                      onError={(e) => {
                        console.error("Failed to load:", baseline.sign_image);
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EError%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setReplaceId(baseline.baseline_id);
                          replaceInputRef.current.click();
                        }}
                        className="bg-white border p-1.5 rounded-full shadow hover:bg-gray-100"
                        title="Replace"
                      >
                        <FaExchangeAlt size={12} className="text-[#003E9C]" />
                      </button>
                      <button
                        onClick={() => handleDeleteBaseline(baseline.baseline_id)}
                        className="bg-white border p-1.5 rounded-full shadow hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash size={12} className="text-red-500" />
                      </button>
                    </div>

                    <p className="absolute bottom-1 text-xs text-gray-600 bg-white px-2 py-0.5 rounded">
                      #{index + 1}
                    </p>
                  </div>
                ))}

                {/* Add Button */}
                {baselines.length < 5 && (
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="aspect-square w-full max-w-[150px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#003E9C] transition-colors"
                  >
                    <FaPlus className="text-[#003E9C] mb-1" size={20} />
                    <span className="text-sm">Tambah</span>
                  </button>
                )}
              </div>

              {/* Options Menu */}
              {showOptions && (
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 border-2 border-[#003E9C] text-[#003E9C] rounded-md flex items-center gap-2 text-sm hover:bg-blue-50 transition-colors"
                  >
                    <FaUpload /> Upload
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawingMode(true);
                      setShowOptions(false);
                    }}
                    className="px-4 py-2 border-2 border-[#003E9C] text-[#003E9C] rounded-md flex items-center gap-2 text-sm hover:bg-blue-50 transition-colors"
                  >
                    <FaPaintBrush /> Draw
                  </button>
                </div>
              )}

              {/* Drawing Canvas */}
              {isDrawingMode && (
                <div className="flex flex-col items-center border p-4 rounded-md overflow-x-auto w-full bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={230}
                    className="border-2 border-gray-300 rounded-md bg-white cursor-crosshair max-w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleClearCanvas}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveDrawing}
                      className="px-4 py-2 bg-[#003E9C] hover:bg-[#002A6B] text-white rounded-md transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsDrawingMode(false);
                        handleClearCanvas();
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📊 Progress:</strong> {baselines.length}/5 baseline signature
                </p>
                {baselines.length < 5 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Anda perlu {5 - baselines.length} baseline lagi untuk sistem verifikasi lengkap.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={replaceInputRef}
        onChange={handleReplaceUpload}
        className="hidden"
      />
    </div>
  );
}
