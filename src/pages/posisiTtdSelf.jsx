import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand, FaQrcode } from "react-icons/fa"; // Tambah Icon QR
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import QRCode from "qrcode"; // Import Library QR Code

export default function PosisiTtdSelf() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  // signatureData tidak lagi dibutuhkan untuk validasi input, tapi state dibiarkan biar gak error
  const [signatureData, setSignatureData] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureArea, setSignatureArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const [clickMode, setClickMode] = useState("signature");

  const API_BASE_URL = "http://localhost:3001";
  const PDF_WIDTH_POINTS = 595.28;
  const PDF_HEIGHT_POINTS = 841.89;

  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");

    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
  }, []);

  useEffect(() => {
    if (containerRef.current && fileUrl) {
      const updateDimensions = () => {
        const rect = containerRef.current.getBoundingClientRect();
        setPdfDimensions({
          width: rect.width,
          height: rect.height,
        });
      };

      setTimeout(updateDimensions, 1000);
      window.addEventListener("resize", updateDimensions);

      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, [fileUrl]);

  const handleClickArea = (e) => {
    if (!clickMode) return;
    if (isDragging || isResizing) return;
    if (e.target.tagName === "IFRAME") return;
    if (e.target.closest(".signature-box")) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    const defaultWidth = 100; // Ukuran default agak besar dikit buat QR
    const defaultHeight = 100;

    const newArea = {
      x: Math.max(0, x - defaultWidth / 2),
      y: Math.max(0, y - defaultHeight / 2),
      width: defaultWidth,
      height: defaultHeight,
    };

    setSignatureArea(newArea);
    setClickMode(null);
  };

  const handleMouseDown = (e) => {
    if (!signatureArea) return;
    e.stopPropagation();
    setIsDragging(true);

    const rect = containerRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left + containerRef.current.scrollLeft - signatureArea.x,
      y: e.clientY - rect.top + containerRef.current.scrollTop - signatureArea.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    const newX = e.clientX - rect.left + scrollLeft - dragStart.current.x;
    const newY = e.clientY - rect.top + scrollTop - dragStart.current.y;

    const maxX = containerRef.current.scrollWidth - signatureArea.width;
    const maxY = containerRef.current.scrollHeight - signatureArea.height;

    setSignatureArea({
      ...signatureArea,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: signatureArea.width,
      height: signatureArea.height,
    };
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    let newWidth = Math.max(60, dragStart.current.width + deltaX);
    let newHeight = Math.max(60, dragStart.current.height + deltaY);

    setSignatureArea({
      ...signatureArea,
      width: newWidth,
      height: newHeight,
    });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, signatureArea]);

  const clearWorkflowFlags = () => {
    localStorage.removeItem("uploadedFileUrl");
    localStorage.removeItem("uploadedFileName");
    localStorage.removeItem("signatureData");
    localStorage.removeItem("signatureFileBase64");
    localStorage.removeItem("uploadedDocumentId");
  };

  // Fungsi Convert Base64 ke Blob (Penting untuk upload gambar)
  const base64ToBlob = (base64String) => {
    try {
      const byteString = atob(base64String.split(',')[1]);
      const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (error) {
      console.error("❌ base64ToBlob error:", error);
      throw new Error(`Failed to convert signature: ${error.message}`);
    }
  };

  // === FUNGSI UTAMA: TEMPEL QR CODE (MODIFIED) ===
  const handleTempelTandaTangan = async () => {
    // 1. Cek Area
    if (!signatureArea) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Area",
        text: "Silakan klik pada dokumen untuk menempatkan QR Code",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    // Note: Kita HAPUS pengecekan !signatureData karena kita generate otomatis

    Swal.fire({
      title: "Memproses...",
      text: "Sedang membuat & menempel QR Code",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");
      let uploadedDocId = localStorage.getItem("uploadedDocumentId");

      if (!token) {
        Swal.fire({ icon: "error", title: "Session Expired", text: "Silakan login kembali" });
        navigate("/login");
        return;
      }

      // 2. Fallback jika ID Dokumen hilang dari localStorage
      if (!uploadedDocId) {
        console.log("⚠️ uploadedDocumentId tidak ada, mencari berdasarkan fileName...");
        const docsResponse = await fetch(`${API_BASE_URL}/documents/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!docsResponse.ok) throw new Error("Gagal mengambil data dokumen");
        const docsData = await docsResponse.json();
        
        const targetDoc = docsData.find(
          (doc) => doc.title === fileName || doc.file_path.includes(fileName)
        );

        if (!targetDoc) throw new Error("Dokumen tidak ditemukan di database. Coba upload ulang.");
        uploadedDocId = targetDoc.document_id;
      }

      // 3. === MAGIC START: GENERATE QR CODE ===
      // Ambil alamat website (Frontend) saat ini. 
      const appBaseUrl = window.location.origin; 
      const verificationLink = `${appBaseUrl}/verif-log/${uploadedDocId}`;
      
      console.log("🔗", verificationLink);

      // Buat gambar QR (Base64)
      const qrBase64 = await QRCode.toDataURL(verificationLink, { 
        width: 300, 
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      // 4. Hitung Koordinat PDF
      const iframeRect = iframeRef.current?.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const displayWidth = iframeRect ? iframeRect.width : containerRect.width;
      const displayHeight = iframeRect ? iframeRect.height : containerRect.height;
      const scaleX = PDF_WIDTH_POINTS / displayWidth;
      const scaleY = PDF_HEIGHT_POINTS / displayHeight;

      const pdfSigX = signatureArea.x * scaleX;
      const pdfSigY = (displayHeight - signatureArea.y - signatureArea.height) * scaleY;
      const pdfSigWidth = signatureArea.width * scaleX;
      const pdfSigHeight = signatureArea.height * scaleY;

      // 5. Convert QR Base64 ke Blob File
      const blob = base64ToBlob(qrBase64);

      // 6. Siapkan FormData
      const formData = new FormData();
      formData.append("signatureImage", blob, "qrcode.png"); // Kirim sebagai signatureImage
      formData.append("pageNumber", "1");
      formData.append("x", String(Math.round(pdfSigX)));
      formData.append("y", String(Math.round(pdfSigY)));
      formData.append("width", String(Math.round(pdfSigWidth)));
      formData.append("height", String(Math.round(pdfSigHeight)));

      // 7. Kirim ke Backend
      const response = await fetch(`${API_BASE_URL}/documents/${uploadedDocId}/sign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Gagal menempel QR");
      }

      localStorage.setItem("lastSignedDocument", uploadedDocId);
      clearWorkflowFlags();

      // === MODIFIKASI DISINI: TEKS JADI "Detail Dokumen" ===
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `QR Code berhasil ditempel! <br> <small> <a href="${verificationLink}" target="_blank" style="color: blue; text-decoration: underline; font-weight: bold;">Detail Dokumen</a></small>`,
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ QR Process error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan sistem",
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
          Pilih Posisi QR Code - {fileName}
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
                    style={{ pointerEvents: clickMode ? "none" : "auto" }}
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
                    className="signature-box absolute border-4 border-blue-500 rounded-lg shadow-2xl cursor-move overflow-hidden bg-white/80 flex justify-center items-center"
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
                    {/* Visualisasi QR di kotak */}
                    <FaQrcode className="text-5xl text-black opacity-70" />

                    <div
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-tl-lg cursor-nwse-resize flex items-center justify-center hover:bg-blue-600 transition"
                      onMouseDown={handleResizeMouseDown}
                    >
                      <FaExpand className="text-white text-xs" />
                    </div>

                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center pointer-events-none shadow-lg">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-400 text-lg font-medium">
                    Loading dokumen...
                  </p>
                </div>
              </div>
            )}
          </div>

          {clickMode === "signature" && !signatureArea && fileUrl && (
            <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-3">
              <p className="text-sm text-blue-700 text-center font-medium">
                👆 Klik pada dokumen untuk menempatkan <strong>QR Code</strong>
              </p>
            </div>
          )}

          {signatureArea && (
            <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
              <p className="text-sm text-green-700 text-center font-medium">
                ✅ Posisi QR Code dipilih • Klik tombol di bawah untuk menempel.
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
              <FaQrcode className="text-2xl" />
              <span>Tempel QR Code</span>
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