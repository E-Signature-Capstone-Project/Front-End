import React, { useState, useEffect } from "react";
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEye,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Swal from "sweetalert2";

const NotificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [list, setList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchIncomingRequests();
  }, [navigate]);

  const fetchIncomingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/requests/incoming`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📥 Incoming requests:", data);

        const requests = data.success ? data.data : data;

        const formattedList = Array.isArray(requests)
          ? requests.map((req) => ({
              id: req.request_id,
              title: req.Document?.title || "Permintaan Tanda Tangan",
              sender: req.requester?.name || "Unknown",
              email: req.requester?.email || req.recipient_email,
              excerpt: req.note || "Mohon tanda tangan dokumen ini.",
              fileName: req.Document?.file_path?.split("/").pop() || "document.pdf",
              filePath: req.Document?.file_path,
              unread: req.status === "pending",
              time: formatTime(req.created_at),
              status: req.status,
              document_id: req.document_id,
              request_id: req.request_id,
            }))
          : [];

        setList(formattedList);
      } else {
        console.error("Failed to fetch requests");
      }
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleApprove = async (item) => {
    try {
      const result = await Swal.fire({
        icon: "question",
        title: "Setujui Permintaan?",
        html: `
          <p>Anda akan menandatangani dokumen <strong>${item.title}</strong></p>
          <p class="text-sm text-gray-600 mt-2">Setelah ini, Anda akan diarahkan untuk memilih posisi QR Code di dokumen.</p>
        `,
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Pilih Posisi QR",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesi Berakhir",
          text: "Silakan login kembali",
          confirmButtonColor: "#003E9C",
        });
        navigate("/login");
        return;
      }

      // ❌ Tidak approve di sini
      // ✅ Hanya ambil baseline untuk external sign
      console.log("🔄 Step 1: Fetching baseline signature...");
      const signatureResponse = await fetch(`${API_BASE_URL}/signature_baseline/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let baselineId = null;

      if (signatureResponse.ok) {
        const signatureResult = await signatureResponse.json();
        console.log("📦 Baseline response:", signatureResult);

        const baselines = signatureResult.baselines || signatureResult || [];
        if (Array.isArray(baselines) && baselines.length > 0) {
          baselineId = baselines[0].baseline_id;
          console.log("✅ Baseline ID found:", baselineId);
        }
      }

      if (!baselineId) {
        throw new Error(
          "Anda belum memiliki tanda tangan baseline. Silakan buat baseline terlebih dahulu di menu Tanda Tangan."
        );
      }

      console.log("🔄 Step 2: Saving to localStorage (context external sign)...");

      // Clear previous data
      localStorage.removeItem("uploadedFileUrl");
      localStorage.removeItem("uploadedFileName");
      localStorage.removeItem("signatureData");
      localStorage.removeItem("uploadedDocumentId");
      localStorage.removeItem("isRequestedDocument");
      localStorage.removeItem("requestId");
      localStorage.removeItem("selectedBaselineId");
      localStorage.removeItem("requesterName");

      // Set data untuk external sign
      localStorage.setItem("selectedBaselineId", baselineId);
      localStorage.setItem("uploadedFileUrl", `${API_BASE_URL}/${item.filePath}`);
      localStorage.setItem("uploadedFileName", item.title);
      localStorage.setItem("uploadedDocumentId", item.document_id);
      localStorage.setItem("isRequestedDocument", "true");
      localStorage.setItem("requestId", item.request_id);
      localStorage.setItem("requesterName", item.sender);

      console.log("✅ Context for external sign saved");
      console.log("  📄 Document ID:", item.document_id);
      console.log("  📄 Request ID:", item.request_id);
      console.log("  🆔 Baseline ID:", baselineId);
      console.log("  📄 File URL:", `${API_BASE_URL}/${item.filePath}`);

      Swal.fire({
        icon: "success",
        title: "Lanjut Pilih Posisi",
        text: "Silakan pilih posisi untuk QR Code di dokumen",
        confirmButtonColor: "#003E9C",
        timer: 1500,
        showConfirmButton: false,
      });

      console.log("🔄 Step 3: Navigating to position page...");

      setTimeout(() => {
        navigate("/posisi-ttd-request");
      }, 500);
    } catch (error) {
      console.error("❌ Approve (prepare) error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Tolak Permintaan?",
        text: "Anda akan menolak permintaan tanda tangan ini",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Tolak",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Ditolak",
          text: "Permintaan tanda tangan telah ditolak",
          confirmButtonColor: "#003E9C",
        });
        fetchIncomingRequests();
        setExpandedId(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menolak permintaan");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <FaClock className="text-xs" />
            Menunggu
          </span>
        );
      case "approved":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <FaCheckCircle className="text-xs" />
            Disetujui
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <FaTimesCircle className="text-xs" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      <div className="flex flex-col flex-1 md:ml-64">
        <Header notificationCount={list.filter((x) => x.unread).length} />

        <div className="p-4 md:p-6">
          <div className="w-full bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Permintaan Tanda Tangan
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {list.filter((x) => x.unread).length} permintaan baru
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-gray-500 mt-3">Memuat notifikasi...</p>
              </div>
            ) : list.length === 0 ? (
              <div className="p-8 text-center">
                <FaEnvelopeOpen className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Tidak ada permintaan tanda tangan
                </p>
              </div>
            ) : (
              <div>
                {list.map((item) => (
                  <div
                    key={item.id}
                    className={`border-b last:border-none transition-colors ${
                      expandedId === item.id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="p-4 flex items-center gap-4 cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        {item.unread ? (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaEnvelope className="text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaEnvelopeOpen className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-semibold text-gray-800 truncate ${
                              item.unread ? "font-bold" : ""
                            }`}
                          >
                            {item.title}
                          </p>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          Dari:{" "}
                          <span className="font-medium">{item.sender}</span> •{" "}
                          {item.excerpt}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.time}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {expandedId === item.id ? (
                          <FaChevronUp className="text-gray-400" />
                        ) : (
                          <FaChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedId === item.id && (
                      <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              Pengirim
                            </p>
                            <p className="text-sm text-gray-800">
                              <strong>{item.sender}</strong>
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.email}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              Catatan
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.excerpt}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              Dokumen
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-2">
                                <p className="text-sm text-gray-800 truncate">
                                  {item.fileName}
                                </p>
                              </div>
                              {item.filePath && (
                                <button
                                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition inline-flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `${API_BASE_URL}/${item.filePath}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <FaEye />
                                  Lihat
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="pt-2">
                            {item.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition inline-flex items-center justify-center gap-2 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(item);
                                  }}
                                >
                                  <FaCheckCircle />
                                  Setuju & Pilih Posisi
                                </button>

                                <button
                                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition inline-flex items-center justify-center gap-2 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(item.request_id);
                                  }}
                                >
                                  <FaTimesCircle />
                                  Tolak
                                </button>
                              </div>
                            )}

                            {(item.status === "approved" ||
                              item.status === "completed") && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                <p className="text-sm text-green-700 font-medium">
                                  ✓ Dokumen sudah Anda setujui dan tandatangani
                                </p>
                              </div>
                            )}

                            {item.status === "rejected" && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                <p className="text-sm text-red-700 font-medium">
                                  ✗ Anda telah menolak permintaan ini
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
