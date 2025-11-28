import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PosisiTtd() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [signatureData, setSignatureData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const [clickMode, setClickMode] = useState(true);

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
      console.log("🔍 Signature from localStorage:");
      console.log("  - Type:", typeof savedSignature);
      console.log("  - Starts with data:", savedSignature.startsWith("data:"));
      console.log("  - Length:", savedSignature.length);
      console.log("  - Preview:", savedSignature.substring(0, 100));
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
        console.log("📐 Container dimensions:", {
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

    const defaultWidth = 150;
    const defaultHeight = 75;

    setSelectedArea({
      x: Math.max(0, x - defaultWidth / 2),
      y: Math.max(0, y - defaultHeight / 2),
      width: defaultWidth,
      height: defaultHeight,
    });

    setClickMode(false);
    console.log("🎯 Area selected at:", { x, y });
  };

  const handleMouseDown = (e) => {
    if (!selectedArea) return;
    e.stopPropagation();
    setIsDragging(true);

    const rect = containerRef.current.getBoundingClientRect();
    dragStart.current = {
      x:
        e.clientX -
        rect.left +
        containerRef.current.scrollLeft -
        selectedArea.x,
      y:
        e.clientY -
        rect.top +
        containerRef.current.scrollTop -
        selectedArea.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedArea || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    const newX = e.clientX - rect.left + scrollLeft - dragStart.current.x;
    const newY = e.clientY - rect.top + scrollTop - dragStart.current.y;

    const maxX = containerRef.current.scrollWidth - selectedArea.width;
    const maxY = containerRef.current.scrollHeight - selectedArea.height;

    setSelectedArea({
      ...selectedArea,
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
      width: selectedArea.width,
      height: selectedArea.height,
    };
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing || !selectedArea) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    const newWidth = Math.max(80, dragStart.current.width + deltaX);
    const newHeight = Math.max(40, dragStart.current.height + deltaY);

    setSelectedArea({
      ...selectedArea,
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
  }, [isDragging, isResizing, selectedArea]);

  const handleTempelTandaTangan = async () => {
    if (!selectedArea) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Area Terlebih Dahulu",
        text: "Silakan klik pada dokumen untuk memilih area tanda tangan",
        confirmButtonColor: "#003E9C",
      });
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
      const isRequestedDoc = localStorage.getItem("isRequestedDocument");
      const requestId = localStorage.getItem("requestId");

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

      if (!signatureData) {
        throw new Error("Data tanda tangan tidak ditemukan");
      }

      console.log("🔍 Processing signature...");
      console.log("  - Type:", typeof signatureData);
      console.log("  - Preview:", signatureData.substring(0, 100));
      console.log("  - Is requested doc:", isRequestedDoc);
      console.log("  - Request ID:", requestId);

      let documentId = uploadedDocId;

      if (!documentId) {
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
      }

      console.log("✅ Document ID:", documentId);

      let blob;

      try {
        let base64Data;
        let mimeType = "image/png";

        if (signatureData.startsWith("data:")) {
          const matches = signatureData.match(
            /^data:([A-Za-z0-9+/\-]+);base64,(.+)$/
          );

          if (matches && matches.length === 3) {
            mimeType = matches[1];
            base64Data = matches[2];
            console.log("✅ Format: Data URL");
          } else {
            throw new Error("Format data URL tidak valid");
          }
        } else {
          base64Data = signatureData;
          console.log("✅ Format: Pure base64");
        }

        base64Data = base64Data
          .trim()
          .replace(/\s+/g, "")
          .replace(/[^A-Za-z0-9+/=]/g, "");

        const paddingNeeded = (4 - (base64Data.length % 4)) % 4;
        if (paddingNeeded > 0) {
          base64Data += "=".repeat(paddingNeeded);
        }

        console.log("🔍 MIME type:", mimeType);
        console.log("🔍 Base64 length:", base64Data.length);

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });

        console.log("✅ Blob created:", blob.size, "bytes");
      } catch (decodeError) {
        console.error("❌ Decode error:", decodeError);
        throw new Error("Gagal decode tanda tangan: " + decodeError.message);
      }

      const iframeRect = iframeRef.current?.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const displayWidth = iframeRect ? iframeRect.width : containerRect.width;
      const displayHeight = iframeRect
        ? iframeRect.height
        : containerRect.height;

      const scaleX = PDF_WIDTH_POINTS / displayWidth;
      const scaleY = PDF_HEIGHT_POINTS / displayHeight;

      const displayX = selectedArea.x;
      const displayY = selectedArea.y;
      const displayWidth_sig = selectedArea.width;
      const displayHeight_sig = selectedArea.height;

      const pdfX = displayX * scaleX;
      const pdfY = (displayHeight - displayY - displayHeight_sig) * scaleY;
      const pdfWidth = displayWidth_sig * scaleX;
      const pdfHeight = displayHeight_sig * scaleY;

      console.log("📊 COORDINATES:");
      console.log("  PDF coords:", {
        x: pdfX.toFixed(2),
        y: pdfY.toFixed(2),
        width: pdfWidth.toFixed(2),
        height: pdfHeight.toFixed(2),
      });

      // ==== BAGIAN YANG DIPERBAIKI ====
      const formData = new FormData();
      formData.append("signatureImage", blob, "signature.png");
      formData.append("pageNumber", "1");
      formData.append("x", String(Math.round(pdfX)));
      formData.append("y", String(Math.round(pdfY)));
      formData.append("width", String(Math.round(pdfWidth)));
      formData.append("height", String(Math.round(pdfHeight)));

      console.log("📦 FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log("  -", key, value);
      }

      const signEndpoint =
        isRequestedDoc === "true" && requestId
          ? `${API_BASE_URL}/requests/${requestId}/sign`
          : `${API_BASE_URL}/documents/${documentId}/sign`;

      console.log("📍 Sign endpoint:", signEndpoint);

      const response = await fetch(signEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // jangan set Content-Type
        },
        body: formData,
      });
      // ================================

      const result = await response.json();
      console.log("📥 Response:", result);

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Gagal menandatangani dokumen"
        );
      }

      localStorage.setItem("lastSignedDocument", documentId);
      localStorage.removeItem("uploadedFileUrl");
      localStorage.removeItem("uploadedFileName");
      localStorage.removeItem("signatureData");
      localStorage.removeItem("uploadedDocumentId");
      localStorage.removeItem("isRequestedDocument");
      localStorage.removeItem("requestId");
      localStorage.removeItem("requesterName");

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: result.message || "Dokumen berhasil ditandatangani",
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Sign error:", error);

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
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-700 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <FaArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-bold text-gray-800">
          Pilih Posisi TTD - {fileName}
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

                {selectedArea && signatureData && (
                  <div
                    className="signature-box absolute border-3 border-blue-500 rounded-lg shadow-2xl cursor-move overflow-hidden"
                    style={{
                      left: `${selectedArea.x}px`,
                      top: `${selectedArea.y}px`,
                      width: `${selectedArea.width}px`,
                      height: `${selectedArea.height}px`,
                      zIndex: 30,
                      backgroundImage: `url(${signatureData})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
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
                      {Math.round(selectedArea.width)} ×{" "}
                      {Math.round(selectedArea.height)} px
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

          {clickMode && !selectedArea && fileUrl && (
            <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-3">
              <p className="text-sm text-blue-700 text-center font-medium">
                👆 Klik pada dokumen untuk menempatkan tanda tangan (Scroll dulu
                untuk cari posisi)
              </p>
            </div>
          )}

          {selectedArea && (
            <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
              <p className="text-sm text-green-700 text-center font-medium">
                ✅ Posisi: X={Math.round(selectedArea.x)}, Y=
                {Math.round(selectedArea.y)} • Drag untuk pindah • Resize di
                pojok kanan bawah •
                <button
                  onClick={() => {
                    setSelectedArea(null);
                    setClickMode(true);
                  }}
                  className="ml-2 text-blue-600 underline hover:text-blue-800"
                >
                  Pilih Ulang
                </button>
              </p>
            </div>
          )}
        </div>

        {selectedArea && (
          <div className="w-full max-w-5xl mx-auto mt-6 px-4 animate-slide-up">
            <button
              onClick={handleTempelTandaTangan}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              <FaCheckCircle className="text-2xl" />
              <span>Tempel Tanda Tangan di Posisi Ini</span>
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .signature-box {
          transition: box-shadow 0.2s ease;
        }

        .signature-box:hover {
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        *::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        *::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
