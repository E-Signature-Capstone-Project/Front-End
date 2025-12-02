import React, { useRef, useState, useEffect } from "react";
import {
  FaPlus,
  FaExchangeAlt,
  FaPaintBrush,
  FaUpload,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const API_BASE = "http://localhost:3001";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const canvasRef = useRef(null);

  const [baselines, setBaselines] = useState([]);
  const [loadingBaselines, setLoadingBaselines] = useState(true);
  const [targetBaselineId, setTargetBaselineId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Fetch user data dari localStorage atau API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          name: userData.name || "",
          email: userData.email || "",
        });
        setNewName(userData.name || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    if (!savedUser) {
      fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((data) => {
          if (data) {
            setUser({
              name: data.name,
              email: data.email,
            });
            setNewName(data.name);
            localStorage.setItem("user", JSON.stringify(data));
          }
        })
        .catch((error) => {
          console.error("Gagal ambil data user:", error);
        });
    }
  }, [navigate]);

  // Fetch baseline signatures dari backend
  useEffect(() => {
    fetchBaselines();
  }, []);

  const fetchBaselines = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
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
      } else {
        const data = await response.json().catch(() => ({}));
        console.error("❌ Fetch baselines failed:", response.status, data);
        setBaselines([]);
      }
    } catch (error) {
      console.error("❌ Error fetching baselines:", error);
      setBaselines([]);
    } finally {
      setLoadingBaselines(false);
    }
  };

  // Update nama user
  const handleSaveName = async () => {
    if (!newName || newName.trim().length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Nama Terlalu Pendek",
        text: "Nama harus minimal 3 karakter",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    setSavingName(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/auth/name`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengupdate nama");
      }

      const updatedUser = { ...user, name: newName.trim() };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      Swal.fire({
        icon: "success",
        title: "Nama Berhasil Diupdate!",
        confirmButtonColor: "#003E9C",
        timer: 1500,
      });

      setIsEditingName(false);
    } catch (error) {
      console.error("❌ Update name error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Update Nama",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    } finally {
      setSavingName(false);
    }
  };

  // Upload baseline baru
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

  // Update baseline dengan upload file baru
  const handleReplaceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !targetBaselineId) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Baseline Dulu",
        text: "Silakan pilih baseline yang ingin diupdate.",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/signature_baseline/${targetBaselineId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || "Gagal update baseline";
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
          title: "Gagal Update Baseline",
          html: errorHtml,
          confirmButtonColor: "#003E9C",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Baseline Berhasil Diupdate!",
        confirmButtonColor: "#003E9C",
        timer: 2000,
      });

      fetchBaselines();
      setTargetBaselineId(null);
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

  // Save drawing sebagai update baseline
  const handleSaveDrawing = async () => {
    if (!targetBaselineId) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Baseline Dulu",
        text: "Silakan klik baseline yang ingin diupdate, lalu gambar tanda tangan.",
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
        const response = await fetch(
          `${API_BASE}/signature_baseline/${targetBaselineId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.message || data.error || "Gagal update baseline";
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
            title: "Gagal Update Baseline",
            html: errorHtml,
            confirmButtonColor: "#003E9C",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Baseline Berhasil Diupdate!",
          confirmButtonColor: "#003E9C",
          timer: 2000,
        });

        fetchBaselines();
        setIsDrawingMode(false);
        setTargetBaselineId(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Fixed */}
      <Sidebar />

      {/* Main Wrapper: di sebelah sidebar */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola profil dan baseline signature Anda
              </p>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white text-3xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>

                {/* User Details */}
                <div className="flex-1">
                  {/* Nama (Editable) */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Nama
                    </label>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C] focus:border-transparent"
                          placeholder="Masukkan nama baru"
                          disabled={savingName}
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={savingName}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                          title="Simpan"
                        >
                          <FaSave size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingName(false);
                            setNewName(user.name);
                          }}
                          disabled={savingName}
                          className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                          title="Batal"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold text-gray-800">
                          {user.name || "Loading..."}
                        </span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1.5 text-[#003E9C] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Nama"
                        >
                          <FaEdit size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{user.email || "-"}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Tidak dapat diubah
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Baseline Signature Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Signature Baseline
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tambah atau update baseline tanda tangan untuk verifikasi AI
                </p>
              </div>

              {/* Loading State */}
              {loadingBaselines ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#003E9C]"></div>
                  <p className="text-gray-500 mt-3">Loading baselines...</p>
                </div>
              ) : (
                <>
                  {/* Baseline Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                    {baselines.map((baseline, index) => (
                      <button
                        key={baseline.baseline_id}
                        type="button"
                        onClick={() => setTargetBaselineId(baseline.baseline_id)}
                        className={`relative aspect-square w-full border-2 rounded-lg shadow-sm bg-white flex items-center justify-center group hover:shadow-md transition-shadow ${
                          targetBaselineId === baseline.baseline_id
                            ? "border-blue-500"
                            : "border-green-500"
                        }`}
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

                        {targetBaselineId === baseline.baseline_id && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
                            Dipilih
                          </div>
                        )}

                        {/* Number Badge */}
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                          #{index + 1}
                        </div>
                      </button>
                    ))}

                    {/* Add Button */}
                    {baselines.length < 5 && (
                      <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-[#003E9C] transition-all"
                      >
                        <FaPlus className="text-[#003E9C] mb-2" size={24} />
                        <span className="text-sm font-medium">Tambah</span>
                      </button>
                    )}
                  </div>

                  {/* Options Menu untuk Tambah Baseline Baru */}
                  {showOptions && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-3">
                        Tambah Baseline Baru
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="flex-1 px-4 py-3 border-2 border-[#003E9C] text-[#003E9C] rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-50 transition-colors"
                        >
                          <FaUpload /> Upload File
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Options Menu untuk Update Baseline yang Dipilih */}
                  {targetBaselineId && (
                    <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-semibold text-orange-900 mb-3">
                        Update Baseline yang Dipilih
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => replaceInputRef.current.click()}
                          className="flex-1 px-4 py-3 border-2 border-[#003E9C] text-[#003E9C] rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-50 transition-colors"
                        >
                          <FaUpload /> Upload File
                        </button>

                        <button
                          onClick={() => setIsDrawingMode(true)}
                          className="flex-1 px-4 py-3 border-2 border-[#003E9C] text-[#003E9C] rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-50 transition-colors"
                        >
                          <FaPaintBrush /> Gambar TTD
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drawing Canvas */}
                  {isDrawingMode && (
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Gambar Tanda Tangan Anda
                      </h3>
                      <div className="flex flex-col items-center">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={250}
                          className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair max-w-full shadow-sm"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                        />

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={handleClearCanvas}
                            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleSaveDrawing}
                            className="px-5 py-2 bg-[#003E9C] hover:bg-[#002A6B] text-white rounded-lg transition-colors font-medium"
                          >
                            Save Baseline
                          </button>
                          <button
                            onClick={() => {
                              setIsDrawingMode(false);
                              handleClearCanvas();
                            }}
                            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          📊 Progress Baseline
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {baselines.length === 5
                            ? "Baseline lengkap! Sistem verifikasi siap digunakan."
                            : `Anda perlu ${5 - baselines.length} baseline lagi untuk sistem verifikasi yang optimal.`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#003E9C]">
                          {baselines.length}/5
                        </div>
                        <div className="text-xs text-gray-600">Baseline</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
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
