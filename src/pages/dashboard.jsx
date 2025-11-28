import React, { useState, useRef, useEffect } from "react";
import {
  FaFolderOpen,
  FaRegFileAlt,
  FaFilePdf,
  FaTimes,
  FaPaperPlane,
  FaSignature,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SignatureForm from "../components/SignatureForm";
import RequestTTD from "../components/RequestTTD";
import ReactDOM from "react-dom/client";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: { container: "swal-container-high-z-index" },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
    const swalContainer = document.querySelector(".swal2-container");
    if (swalContainer) swalContainer.style.zIndex = "999999";
  },
});

const MySwal = withReactContent(Swal);

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [lastUploadedDocId, setLastUploadedDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔴 NAMA USER UNTUK HEADER
  const [userName, setUserName] = useState("User");

  const API_BASE_URL = "http://localhost:3001";

  // 🔴 BACA USER DARI LOCALSTORAGE (DIISI SAAT LOGIN)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.log("❌ localStorage.user kosong");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      console.log("📦 parsed user:", parsed);

      // backend kirim { user: { user_id, name, email, role } }
      const nameFromBackend = parsed.name;

      console.log("👤 name for header:", nameFromBackend);
      setUserName(nameFromBackend || "User");
    } catch (err) {
      console.error("Gagal parse user dari localStorage", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesi Berakhir",
        text: "Silakan login terlebih dahulu",
        confirmButtonColor: "#003E9C",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    fetchDocuments();

    const lastSigned = localStorage.getItem("lastSignedDocument");
    if (lastSigned) {
      setTimeout(() => {
        fetchDocuments();
      }, 500);
      localStorage.removeItem("lastSignedDocument");
    }
  }, [navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDocuments();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/documents/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const sortedDocs = data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          const signedDocs = sortedDocs
            .filter((doc) => doc.status === "signed")
            .map((doc) => ({
              id: doc.document_id,
              name: doc.title,
              date: new Date(doc.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              timestamp: new Date(doc.created_at).getTime(),
              fileUrl: `${API_BASE_URL}/${doc.file_path}`,
            }))
            .slice(0, 10);

          setDocuments(signedDocs);

          if (sortedDocs.length > 0) {
            setLastUploadedDocId(sortedDocs[0].document_id);
          }
        } else {
          setDocuments([]);
        }
      } else {
        console.warn("⚠️ Failed to fetch documents:", response.status);
        setDocuments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching documents:", error);
      setDocuments([]);
    }
  };

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire({
      icon: "warning",
      title: "Sesi Telah Berakhir",
      text: "Sesi Anda telah habis. Silakan login kembali.",
      confirmButtonText: "Login Kembali",
      confirmButtonColor: "#003E9C",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      navigate("/login");
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "File Tidak Valid",
        text: "Hanya file PDF yang diperbolehkan",
        confirmButtonColor: "#003E9C",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Terlalu Besar",
        text: "Ukuran file maksimal 10MB",
        confirmButtonColor: "#003E9C",
      });
      e.target.value = "";
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleSessionExpired();
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionExpired();
          return;
        }
        throw new Error(data.error || data.message || "Upload gagal");
      }

      setSelectedFile(file);

      if (data.document && data.document.document_id) {
        setLastUploadedDocId(data.document.document_id);
      }

      fetchDocuments();
      Toast.fire({
        icon: "success",
        title: "Upload Berhasil!",
        text: `File ${file.name} berhasil diupload`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: error.message || "Gagal mengupload dokumen",
        confirmButtonColor: "#003E9C",
      });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = () => {
    Swal.fire({
      icon: "warning",
      title: "Hapus File?",
      text: "Apakah Anda yakin ingin menghapus file ini?",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedFile(null);
        setLastUploadedDocId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        Toast.fire({ icon: "success", title: "File berhasil dihapus" });
      }
    });
  };

  function handleOpenRequestTTD() {
    if (!lastUploadedDocId && !selectedFile) {
      Toast.fire({
        icon: "warning",
        title: "Pilih dokumen dulu untuk request TTD",
      });
      return;
    }

    MySwal.fire({
      html: (
        <RequestTTD
          onSend={async (to, notes) => {
            if (!to) {
              MySwal.showValidationMessage("Email penerima wajib diisi!");
              return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
              MySwal.fire({
                icon: "warning",
                title: "Session expired!",
                text: "Login dulu.",
              });
              return;
            }

            try {
              const response = await fetch(`${API_BASE_URL}/requests`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  document_id: lastUploadedDocId,
                  recipientEmail: to,
                  note: notes,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message || "Gagal mengirim permintaan"
                );
              }

              const result = await response.json();
              console.log("✅ Request TTD sent:", result);

              MySwal.close();

              Swal.fire({
                icon: "success",
                title: "Permintaan Terkirim!",
                html: `
                  <p>Permintaan tanda tangan telah berhasil dikirim ke:</p>
                  <p class="font-semibold text-blue-600 mt-2">${to}</p>
                  <p class="text-sm text-gray-600 mt-3">Penerima akan menerima notifikasi dan dapat menyetujui permintaan Anda.</p>
                `,
                confirmButtonColor: "#003E9C",
                confirmButtonText: "OK",
              }).then(() => {
                setSelectedFile(null);
                setLastUploadedDocId(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                fetchDocuments();
              });
            } catch (err) {
              console.error("❌ Error sending request:", err);
              MySwal.showValidationMessage(err.message);
            }
          }}
        />
      ),
      showConfirmButton: false,
      showCloseButton: true,
      width: 400,
      padding: "0 0 22px 0",
      customClass: { popup: "p-0" },
    });
  }

  function handleOpenSignatureModal() {
    if (!selectedFile) {
      Toast.fire({
        icon: "warning",
        title: "Pilih dokumen dulu",
      });
      return;
    }

    MySwal.fire({
      title: "Tanda Tangan",
      html: '<div id="signature-root"></div>',
      showCancelButton: false,
      showConfirmButton: false,
      showCloseButton: true,
      width: "700px",
      padding: "30px",
      didOpen: () => {
        const container = document.getElementById("signature-root");
        if (container) {
          const root = ReactDOM.createRoot(container);
          root.render(
            <SignatureForm
              onChange={() => {}}
              onConfirm={(signatureData) => {
                if (selectedFile) {
                  const fileUrl = URL.createObjectURL(selectedFile);
                  localStorage.setItem("uploadedFileUrl", fileUrl);
                  localStorage.setItem("uploadedFileName", selectedFile.name);
                  localStorage.setItem(
                    "uploadedDocumentId",
                    lastUploadedDocId
                  );
                }
                localStorage.setItem("signatureData", signatureData);
                Swal.close();
                navigate("/posisi-ttd");
              }}
            />
          );
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 font-sans">
      <style>{`
        .swal2-container,
        .swal-container-high-z-index { z-index: 999999 !important; }
      `}</style>

      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col">
        {/* 🔴 NAMA DARI BE DIKIRIM KE HEADER */}
        <Header userName={userName} />

        <div className="flex-1 overflow-y-auto">
          <div className="w-full bg-white">
            <div className="px-8 py-8">
              <div className="max-w-2xl mx-auto">
                {/* Upload Section */}
                <div className="min-h-44 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center text-gray-400 p-6">
                  {selectedFile ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                            <FaFilePdf className="text-2xl" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-base">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Siap untuk ditandatangani •{" "}
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteFile}
                          className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                          title="Hapus file"
                        >
                          <FaTimes className="text-xl" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={handleOpenRequestTTD}
                          className="w-full flex items-center justify-center gap-2 bg-[#003E9C] hover:bg-[#002A6B] text-white font-semibold py-3 rounded-lg transition shadow-md"
                        >
                          <FaPaperPlane className="text-lg" />
                          <span>Request TTD</span>
                        </button>
                        <button
                          onClick={handleOpenSignatureModal}
                          className="w-full flex items-center justify-center gap-2 bg-[#003E9C] hover:bg-[#002A6B] text-white font-semibold py-3 rounded-lg transition shadow-md"
                        >
                          <FaSignature className="text-lg" />
                          <span>Tandatangani Dokumen</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaRegFileAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                      <div className="text-gray-500">
                        Belum ada dokumen terpilih
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Upload file PDF untuk memulai
                      </div>
                    </div>
                  )}
                </div>

                {!selectedFile && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={loading}
                      className="mt-5 w-1/2 mx-auto bg-[#003E9C] hover:bg-[#002A6B] transition text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <FaFolderOpen className="text-xl" />
                      <span>{loading ? "Mengupload..." : "Upload Dokumen"}</span>
                    </button>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Hanya file PDF yang diperbolehkan (maksimal 10MB)
                    </p>
                  </>
                )}

                {/* Riwayat Dokumen */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Riwayat Dokumen
                    </h3>
                    {documents.length > 0 && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {documents.length} Terbaru
                      </span>
                    )}
                  </div>

                  {documents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <FaRegFileAlt className="text-5xl mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        Belum ada dokumen selesai
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Dokumen yang sudah selesai ditandatangani akan muncul di
                        sini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 transition-all hover:shadow-md cursor-pointer flex items-center justify-between"
                          onClick={() => window.open(doc.fileUrl, "_blank")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                              <FaFilePdf className="text-lg" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm truncate">
                                {doc.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {doc.date}
                              </p>
                            </div>
                          </div>
                          <span className="text-2xl text-gray-400">
                            <svg
                              width="24"
                              height="24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
