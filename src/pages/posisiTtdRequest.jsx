import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PosisiTtdRequest() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [signatureArea, setSignatureArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false); // Mengaktifkan kembali state isResizing
  const [currentDocumentId, setCurrentDocumentId] = useState(null); 
  
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, width: 0, height: 0 }); // Tambah width/height untuk resize
  const [clickMode, setClickMode] = useState("signature");

  const API_BASE_URL = "http://localhost:3001";

  /**
   * Fungsi untuk membersihkan semua flag workflow dari local storage.
   */
  const clearWorkflowFlags = () => {
    localStorage.removeItem("uploadedFileUrl");
    localStorage.removeItem("uploadedFileName");
    localStorage.removeItem("signatureData");
    localStorage.removeItem("signatureFileBase64");
    localStorage.removeItem("uploadedDocumentId");
    localStorage.removeItem("isRequestedDocument");
    localStorage.removeItem("requestId");
    localStorage.removeItem("requesterName");
    localStorage.removeItem("selectedBaselineId");
  };

  // 🛑 Validasi Data Kunci saat Mounting
  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");
    const savedDocId = localStorage.getItem("uploadedDocumentId");
    const requestId = localStorage.getItem("requestId");
    const baselineId = localStorage.getItem("selectedBaselineId"); // Wajib ada untuk external sign
    
    // Validasi data kunci. Jika salah satu hilang, sesi dianggap tidak valid.
    if (!savedFileUrl || !savedDocId || !requestId || !baselineId) {
        if (savedFileUrl || savedDocId || requestId || baselineId) {
             Swal.fire({
                icon: "warning",
                title: "Sesi Tanda Tangan Hilang",
                text: "Data dokumen, request, atau baseline tidak lengkap. Silakan mulai ulang dari notifikasi.",
                confirmButtonColor: "#003E9C",
            });
        }
        clearWorkflowFlags();
        // Redirect ke notifikasi
        if (window.location.pathname !== '/notification') {
             navigate("/notification");
        }
        return;
    }
    
    setFileUrl(savedFileUrl);
    setFileName(savedFileName);
    setCurrentDocumentId(savedDocId);

  }, [navigate]);

  const handleClickArea = (e) => {
    if (!clickMode || isDragging || isResizing || e.target.tagName === "IFRAME" || e.target.closest(".signature-box") || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    // Set default ukuran area tanda tangan (misalnya 96x96 piksel)
    const defaultWidth = 96;
    const defaultHeight = 96;

    const newArea = {
      x: Math.max(0, x - defaultWidth / 2),
      y: Math.max(0, y - defaultHeight / 2),
      width: defaultWidth,
      height: defaultHeight,
    };

    setSignatureArea(newArea);
    setClickMode(null);
  };

  // --- Fungsi Drag/Resize (Menggunakan useCallback) ---
  
  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
    }
  }, [isDragging, isResizing]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || (!isDragging && !isResizing)) return;

    if (isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const scrollTop = containerRef.current.scrollTop;

      const newX = e.clientX - rect.left + scrollLeft - dragStart.current.x;
      const newY = e.clientY - rect.top + scrollTop - dragStart.current.y;

      const maxX = containerRef.current.scrollWidth - signatureArea.width;
      const maxY = containerRef.current.scrollHeight - signatureArea.height;

      setSignatureArea((prevArea) => ({
        ...prevArea,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      }));
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      // Minimum size 60px
      let newWidth = Math.max(60, dragStart.current.width + deltaX);
      let newHeight = Math.max(60, dragStart.current.height + deltaY);

      setSignatureArea((prevArea) => ({
        ...prevArea,
        width: newWidth,
        height: newHeight,
      }));
    }
  }, [isDragging, isResizing, signatureArea]);


  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } 

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);


  const handleMouseDown = (e) => {
    if (!signatureArea) return;
    e.stopPropagation();
    setIsDragging(true);

    const rect = containerRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left + containerRef.current.scrollLeft - signatureArea.x,
      y: e.clientY - rect.top + containerRef.current.scrollTop - signatureArea.y,
      width: signatureArea.width, // Hanya perlu untuk resize, tapi diisi untuk konsistensi
      height: signatureArea.height,
    };
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true); // 🚨 Aktifkan resize
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: signatureArea.width,
      height: signatureArea.height,
    };
  };
  // --- Akhir Fungsi Drag/Resize ---


  // === FUNGSI UTAMA: TEMPEL TANDA TANGAN BASELINE ===
  const handleTempelTandaTangan = async () => {
    if (!signatureArea) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Area",
        text: "Silakan pilih area untuk Tanda Tangan",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    Swal.fire({
      title: "Memproses...",
      text: "Sedang menandatangani dokumen dengan baseline",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");
      let documentId = currentDocumentId; 
      const requestId = localStorage.getItem("requestId");
      let baseline_id = localStorage.getItem("selectedBaselineId");
      
      console.log("🔍 [REQUEST SIGN] Status Awal Data:", {
          documentId,
          requestId,
          baseline_id,
          hasToken: !!token
      });


      // --- Blok Validasi Keras ---
      if (!token) throw new Error("Session Expired. Silakan login kembali.");
      if (!requestId) throw new Error("Sesi data request hilang. (Request ID tidak ditemukan)");
      if (!documentId) throw new Error("Sesi ID dokumen hilang. Silakan mulai ulang.");
      if (!baseline_id) throw new Error("Baseline ID hilang. Silakan mulai ulang.");
      // --- Akhir Blok Validasi Keras ---


      // 🚨 PERUBAHAN KRUSIAL: Konversi Koordinat
      // 3. Ambil Tinggi Kontainer Dokumen (ViewPort)
      const displayHeight = containerRef.current.scrollHeight; 

      // 4. Kirim koordinat Viewport mentah (Y dari Atas)
      const viewportSigX = signatureArea.x;
      const viewportSigY = signatureArea.y; // Y dari Atas
      const viewportSigWidth = signatureArea.width;
      const viewportSigHeight = signatureArea.height;
      // 🚨 Tidak perlu konversi Y ke PDF di frontend! Biarkan backend yang menangani.

      console.log("✅ [REQUEST SIGN] Data Final yang digunakan (Viewport Y dari Atas):", { 
          documentId, 
          requestId, 
          baseline_id, 
          displayHeight, 
          x: Math.round(viewportSigX),
          y: Math.round(viewportSigY),
      });

      // 5. Kirim data ke Backend
      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/sign/external`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", 
          },
          body: JSON.stringify({
            baseline_id: baseline_id,
            pageNumber: 1, // Default ke halaman 1
            x: Math.round(viewportSigX),
            y: Math.round(viewportSigY), // Y Viewport (dari Atas)
            width: Math.round(viewportSigWidth),
            height: Math.round(viewportSigHeight),
            displayHeight: Math.round(displayHeight), // Kunci untuk konversi Y di backend
          }),
        }
      );

      const result = await response.json();
      console.log("📥 Backend response (sign/external):", result);

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Gagal menandatangani dokumen"
        );
      }

      localStorage.setItem("lastSignedDocument", documentId);
      clearWorkflowFlags();

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `
          <p>${result.message || "Dokumen berhasil ditandatangani"}</p>
          <p class="text-sm text-gray-600 mt-2">✅ Tanda tangan dan QR Code sudah ditempel</p>
        `,
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ REQUEST SIGN error:", error);
      
      const errorMessage = error.message;

      // Jika data utama request hilang, kembalikan ke notifikasi
      if (errorMessage.includes("Sesi data request hilang") || 
          errorMessage.includes("Sesi ID dokumen hilang") || 
          errorMessage.includes("Baseline ID hilang")) {
           Swal.fire({
             icon: "error",
             title: "Sesi Tidak Valid",
             text: errorMessage,
             confirmButtonColor: "#003E9C",
           }).then(() => navigate("/notification"));
           return;
      }
      
      // Jika error dari backend (misalnya status request belum approved)
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage || "Terjadi kesalahan saat menandatangani dokumen",
        confirmButtonColor: "#003E9C",
      });
      
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <header className="w-full bg-white shadow-sm py-4 px-6 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => {
            clearWorkflowFlags();
            navigate(-1);
          }}
          className="text-gray-600 hover:text-blue-700 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <FaArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-bold text-gray-800">
          Pilih Posisi Tanda Tangan - {fileName}
        </h1>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6">
        <div
          className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <div
            ref={containerRef}
            className="relative w-full flex-1 overflow-auto bg-gray-100"
            style={{ minHeight: "500px" }}
            onClick={clickMode ? handleClickArea : undefined}
          >
            {fileUrl ? (
              <div className="relative w-full h-full">
                {fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    ref={iframeRef}
                    src={fileUrl}
                    title="Preview PDF"
                    className="w-full h-full min-h-[1100px] border-none"
                    // Matikan pointer events di iframe saat menunggu klik
                    style={{ pointerEvents: (clickMode || signatureArea) ? "none" : "auto" }}
                  ></iframe>
                ) : (
                  <img
                    src={fileUrl}
                    alt="Preview Dokumen"
                    className="w-full h-auto object-contain"
                  />
                )}

                {signatureArea && (
                  <div
                    className="signature-box absolute border-4 border-blue-500 rounded-lg shadow-2xl cursor-move overflow-hidden bg-white/70"
                    style={{
                      left: `${signatureArea.x}px`,
                      top: `${signatureArea.y}px`,
                      width: `${signatureArea.width}px`,
                      height: `${signatureArea.height}px`,
                      zIndex: 30,
                      pointerEvents: "auto",
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    <div
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-tl-lg cursor-nwse-resize flex items-center justify-center hover:bg-blue-600 transition"
                      onMouseDown={handleResizeMouseDown}
                    >
                      <FaExpand className="text-white text-xs" />
                    </div>

                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center pointer-events-none shadow-lg">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>

                    <div className="absolute -bottom-7 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                      Tanda Tangan • {Math.round(signatureArea.width)} ×{" "}
                      {Math.round(signatureArea.height)} px
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-400 text-lg font-medium">
                    Belum ada dokumen
                  </p>
                </div>
              </div>
            )}
          </div>

          {clickMode === "signature" && !signatureArea && fileUrl && (
            <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-3">
              <p className="text-sm text-blue-700 text-center font-medium">
                👆 Klik pada dokumen untuk menempatkan <strong>Tanda Tangan</strong>
              </p>
            </div>
          )}

          {signatureArea && (
            <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
              <p className="text-sm text-green-700 text-center font-medium">
                ✅ Posisi Tanda Tangan dipilih • Klik tombol di bawah untuk menempel.
                <button
                  onClick={() => {
                    setSignatureArea(null);
                    setClickMode("signature");
                  }}
                  className="ml-2 text-blue-600 underline hover:text-blue-800"
                >
                  Pilih Ulang
                </button>
              </p>
            </div>
          )}
        </div>

        {signatureArea && (
          <div className="w-full max-w-5xl mx-auto mt-6 px-4 animate-slide-up">
            <button
              onClick={handleTempelTandaTangan}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              <FaCheckCircle className="text-2xl" />
              <span>Tempel Tanda Tangan</span>
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .signature-box { transition: box-shadow 0.2s ease; }
        .signature-box:hover { box-shadow: 0 8px 24px rgba(59,130,246,0.4); }
        *::-webkit-scrollbar { width: 10px; height: 10px; }
        *::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        *::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
}