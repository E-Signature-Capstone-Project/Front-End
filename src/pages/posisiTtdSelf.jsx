import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand } from "react-icons/fa";
import SignatureForm from "../components/SignatureForm";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PosisiTtdSelf() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
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
    const savedSignature = localStorage.getItem("signatureData");

    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
    if (savedSignature) {
      console.log("📋 Loaded signature from localStorage:", {
        length: savedSignature.length,
        preview: savedSignature.substring(0, 50) + "...",
      });
      setSignatureData(savedSignature);
    }
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

  const base64ToBlob = (base64String) => {
    try {
      console.log("🔄 Converting base64 to blob...");

      if (!base64String || typeof base64String !== "string") {
        throw new Error("Invalid base64 string: not a string");
      }

      let base64Data;
      let mimeType = "image/png";

      if (base64String.startsWith("data:")) {
        const matches = base64String.match(/^data:([A-Za-z0-9+/\-]+);base64,(.+)$/);

        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          throw new Error("Invalid data URL format");
        }
      } else {
        base64Data = base64String;
      }

      base64Data = base64Data
        .trim()
        .replace(/\s+/g, "")
        .replace(/[^A-Za-z0-9+/=]/g, "");

      const paddingNeeded = (4 - (base64Data.length % 4)) % 4;
      if (paddingNeeded > 0) {
        base64Data += "=".repeat(paddingNeeded);
      }

      console.log("📊 Base64 stats:", {
        originalLength: base64String.length,
        cleanedLength: base64Data.length,
        mimeType: mimeType,
      });

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteNumbers], { type: mimeType });

      if (blob.size === 0) {
        throw new Error("Generated blob is empty (size = 0)");
      }

      if (blob.size < 100) {
        throw new Error(`Generated blob too small (size = ${blob.size} bytes)`);
      }

      console.log("✅ Blob created successfully:", {
        size: blob.size,
        type: blob.type,
      });

      return blob;
    } catch (error) {
      console.error("❌ base64ToBlob error:", error);
      throw new Error(`Failed to convert signature: ${error.message}`);
    }
  };

  const handleTempelTandaTangan = async () => {
    if (!signatureArea) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Area",
        text: "Silakan pilih area untuk QR Code",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    if (!signatureData) {
      Swal.fire({
        icon: "warning",
        title: "Tanda Tangan Diperlukan",
        text: "Silakan buat tanda tangan terlebih dahulu",
        confirmButtonColor: "#003E9C",
      });
      setShowSignatureModal(true);
      return;
    }

    Swal.fire({
      title: "Memproses...",
      text: "Sedang menandatangani dokumen",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");
      const uploadedDocId = localStorage.getItem("uploadedDocumentId");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Silakan login kembali",
          confirmButtonColor: "#003E9C",
        });
        navigate("/login");
        return;
      }

      let documentId = uploadedDocId;

      if (!documentId) {
        console.log("⚠️ uploadedDocumentId tidak ada, mencari berdasarkan fileName...");
        const docsResponse = await fetch(`${API_BASE_URL}/documents/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!docsResponse.ok) {
          throw new Error("Gagal mengambil data dokumen");
        }

        const docsData = await docsResponse.json();
        console.log("📦 Documents dari API:", docsData);

        const targetDoc = docsData.find(
          (doc) =>
            doc.title === fileName ||
            doc.file_path.includes(fileName) ||
            doc.title.includes(fileName.replace(".pdf", ""))
        );

        if (!targetDoc) {
          throw new Error("Dokumen tidak ditemukan di database");
        }

        documentId = targetDoc.document_id;
        console.log("✅ Dokumen ditemukan dari pencarian:", documentId);
      }

      console.log("✅ Final documentId yang akan dipakai:", documentId);

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

      console.log("📐 PDF coordinates:", {
        x: Math.round(pdfSigX),
        y: Math.round(pdfSigY),
        width: Math.round(pdfSigWidth),
        height: Math.round(pdfSigHeight),
      });

      console.log("🔄 Converting signature to blob...");
      const blob = base64ToBlob(signatureData);

      const formData = new FormData();
      formData.append("signatureImage", blob, "signature.png");
      formData.append("pageNumber", "1");
      formData.append("x", String(Math.round(pdfSigX)));
      formData.append("y", String(Math.round(pdfSigY)));
      formData.append("width", String(Math.round(pdfSigWidth)));
      formData.append("height", String(Math.round(pdfSigHeight)));

      console.log("📤 Sending FormData with signature image to /sign endpoint");

      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("📥 Backend response:", result);

      if (!response.ok) {
        throw new Error(result.error || result.message || "Gagal menandatangani dokumen");
      }

      localStorage.setItem("lastSignedDocument", documentId);
      clearWorkflowFlags();

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `
          <p>${result.message || "Dokumen berhasil ditandatangani"}</p>
          <p class="text-sm text-gray-600 mt-2">✅ QR Code otomatis ditambahkan di dokumen</p>
        `,
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ SELF SIGN error:", error);
      clearWorkflowFlags();

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat menandatangani dokumen",
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
                      QR • {Math.round(signatureArea.width)} ×{" "}
                      {Math.round(signatureArea.height)} px
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FaArrowLeft className="text-6xl text-gray-300 mx-auto mb-4 rotate-90" />
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
                👆 Klik pada dokumen untuk menempatkan <strong>QR Code</strong>
              </p>
            </div>
          )}

          {signatureArea && (
            <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
              <p className="text-sm text-green-700 text-center font-medium">
                ✅ Posisi sudah dipilih • Drag untuk pindah • Resize di pojok
                kanan bawah •
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
              <span>Tempel QR Code</span>
            </button>
          </div>
        )}

        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl relative shadow-2xl">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-center mb-4">
                Tanda Tangan
              </h2>

              <SignatureForm
                onConfirm={(data) => {
                  if (typeof data === "object" && data.base64) {
                    localStorage.setItem("signatureData", data.base64);
                    setSignatureData(data.base64);
                  } else {
                    localStorage.setItem("signatureData", data);
                    setSignatureData(data);
                  }
                  setShowSignatureModal(false);
                }}
              />
            </div>
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
