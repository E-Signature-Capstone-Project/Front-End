import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PosisiTtdRequest() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [signatureArea, setSignatureArea] = useState(null); // relatif ke kanvas Page
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const wrapperRef = useRef(null); // wrapper scrollable
  const dragStart = useRef({ x: 0, y: 0 });
  const [clickMode, setClickMode] = useState("signature");
  const [renderWidth, setRenderWidth] = useState(600);
  const [renderHeight, setRenderHeight] = useState(800);

  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");
    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
  }, []);

  // Sesuaikan lebar render dengan lebar container
  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setRenderWidth(rect.width - 40); // beri sedikit margin kiri/kanan
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // react-pdf memberi ukuran halaman aktual; dari situ bisa hitung tinggi render
  const handlePageRenderSuccess = (page) => {
    const pageRatio = page.height / page.width;
    setRenderHeight(renderWidth * pageRatio);
  };

  // ================== PILIH AREA (RELATIF PAGE WRAPPER) ==================

  const handleClickArea = (e) => {
    if (!clickMode) return;
    if (isDragging || isResizing) return;
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top + wrapperRef.current.scrollTop;

    if (clickX < 0 || clickY < 0 || clickX > rect.width || clickY > renderHeight) {
      return;
    }

    const defaultSize = 70;

    const newArea = {
      x: Math.max(0, clickX - defaultSize / 2),
      y: Math.max(0, clickY - defaultSize / 2),
      width: defaultSize,
      height: defaultSize,
    };

    console.log("🎯 QR Area Selected:", {
      viewport: { x: newArea.x, y: newArea.y, size: defaultSize },
      wrapperSize: { width: rect.width, height: renderHeight },
    });

    setSignatureArea(newArea);
    setClickMode(null);
  };

  // ================== DRAG & RESIZE ==================

  const handleMouseDown = (e) => {
    if (!signatureArea || !wrapperRef.current) return;
    e.stopPropagation();
    setIsDragging(true);

    const rect = wrapperRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top + wrapperRef.current.scrollTop;

    dragStart.current = {
      x: clickX - signatureArea.x,
      y: clickY - signatureArea.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !wrapperRef.current || !signatureArea) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top + wrapperRef.current.scrollTop;

    const newX = currentX - dragStart.current.x;
    const newY = currentY - dragStart.current.y;

    const maxX = rect.width - signatureArea.width;
    const maxY = renderHeight - signatureArea.height;

    setSignatureArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e) => {
    if (!signatureArea) return;
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
    if (!isResizing || !wrapperRef.current) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    const delta = Math.max(deltaX, deltaY);
    let newSize = Math.max(40, Math.min(120, dragStart.current.width + delta));

    const rect = wrapperRef.current.getBoundingClientRect();
    const maxW = rect.width - signatureArea.x;
    const maxH = renderHeight - signatureArea.y;
    newSize = Math.min(newSize, maxW, maxH);

    setSignatureArea((prev) => ({
      ...prev,
      width: newSize,
      height: newSize,
    }));
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
  }, [isDragging, isResizing]);

  // ================== HELPERS ==================

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

  // ================== SUBMIT ==================

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

    if (!wrapperRef.current) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "PDF viewer belum siap",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    const rect = wrapperRef.current.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = renderHeight;

    const ratioX = signatureArea.x / displayWidth; // dari kiri
    const ratioY = signatureArea.y / displayHeight; // dari atas

    const avgSize = (signatureArea.width + signatureArea.height) / 2;
    const ratioSize = avgSize / displayWidth;

    const isSquare = Math.abs(signatureArea.width - signatureArea.height) < 2;

    console.log("📤 SENDING TO BACKEND:", {
      page: currentPage,
      wrapperSize: { displayWidth, displayHeight },
      box: { ...signatureArea },
      ratios: { ratioX, ratioY, ratioSize },
    });

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Penempatan QR",
      html: `
        <div class="text-left text-sm space-y-3">
          <div class="bg-blue-50 p-3 rounded border border-blue-200">
            <p class="font-bold mb-2 text-blue-800">📍 Posisi QR Code:</p>
            <ul class="text-xs space-y-1">
              <li>📄 Halaman: <strong>${currentPage}</strong></li>
              <li>📏 Ukuran kotak: <strong>${Math.round(
                signatureArea.width
              )}×${Math.round(signatureArea.height)}px</strong> ${
        isSquare ? "✅" : "⚠️"
      }</li>
              <li>📐 Rasio dari kiri: <strong>${(ratioX * 100).toFixed(
                1
              )}%</strong></li>
              <li>📐 Rasio dari atas: <strong>${(ratioY * 100).toFixed(
                1
              )}%</strong></li>
              <li>📐 Rasio size: <strong>${(ratioSize * 100).toFixed(
                1
              )}% lebar halaman</strong></li>
            </ul>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Tempel QR",
      cancelButtonText: "❌ Batal",
      confirmButtonColor: "#003E9C",
      width: "650px",
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Memproses...",
      text: "Menempatkan QR Code...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => Swal.showLoading(),
    });

    try {
      const token = localStorage.getItem("token");
      const uploadedDocId = localStorage.getItem("uploadedDocumentId");

      if (!token) throw new Error("Token tidak ditemukan");

      let documentId = uploadedDocId;

      if (!documentId) {
        const docsResponse = await fetch(`${API_BASE_URL}/documents/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!docsResponse.ok) throw new Error("Gagal mengambil data dokumen");

        const docsData = await docsResponse.json();
        const targetDoc = docsData.find(
          (doc) =>
            doc.title === fileName ||
            doc.file_path.includes(fileName) ||
            doc.title.includes(fileName.replace(".pdf", ""))
        );

        if (!targetDoc) throw new Error("Dokumen tidak ditemukan");
        documentId = targetDoc.document_id;
      }

      let baseline_id = localStorage.getItem("selectedBaselineId");
      if (!baseline_id) {
        const baselineResponse = await fetch(
          `${API_BASE_URL}/signature_baseline/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!baselineResponse.ok)
          throw new Error("Tidak dapat mengambil data baseline");

        const baselinesData = await baselineResponse.json();
        const baselines = Array.isArray(baselinesData)
          ? baselinesData
          : baselinesData.baselines || [];

        if (!baselines.length)
          throw new Error("Anda belum memiliki baseline signature");

        baseline_id = baselines[0].baseline_id;
        localStorage.setItem("selectedBaselineId", baseline_id);
      }

      const payload = {
        baseline_id: baseline_id,
        pageNumber: currentPage,
        ratioX,
        ratioY,
        ratioSize,
      };

      console.log("📨 Final Payload:", payload);

      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/sign/external`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("📥 Backend Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Gagal menandatangani dokumen");
      }

      localStorage.setItem("lastSignedDocument", documentId);
      clearWorkflowFlags();

      await Swal.fire({
        icon: "success",
        title: "✅ Berhasil!",
        html: `<p class="text-lg mb-3">${result.message}</p>`,
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#003E9C",
      });
    }
  };

  // ================== RENDER ==================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <header className="w-full bg-white shadow-sm py-4 px-6 flex flex-col gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-4">
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
        </div>

        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className="text-gray-700 font-medium">Halaman:</span>
          <input
            type="number"
            min={1}
            value={currentPage}
            onChange={(e) =>
              setCurrentPage(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-700">
            💡 Klik di PDF • Default 70×70px • Drag pindah • Resize pojok
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6">
        <div
          className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 240px)" }}
        >
          <div
            ref={wrapperRef}
            className="relative w-full flex-1 bg-gray-100 overflow-auto"
            onClick={clickMode ? handleClickArea : undefined}
            style={{ cursor: clickMode ? "crosshair" : "default" }}
          >
            {fileUrl ? (
              <div
                style={{
                  position: "relative",
                  margin: "20px auto",
                  width: `${renderWidth}px`,
                  minHeight: `${renderHeight}px`,
                }}
              >
                <Document file={fileUrl}>
                  <Page
                    pageNumber={currentPage}
                    width={renderWidth}
                    onRenderSuccess={handlePageRenderSuccess}
                  />
                </Document>

                {signatureArea && (
                  <div
                    className="signature-box absolute border-2 border-blue-500 rounded cursor-move bg-blue-100/20"
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
                    <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-xs">
                      QR
                    </div>

                    <div
                      className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-tl cursor-nwse-resize flex items-center justify-center hover:bg-blue-600"
                      onMouseDown={handleResizeMouseDown}
                    >
                      <FaExpand className="text-white text-[8px]" />
                    </div>

                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow">
                      <FaCheckCircle className="text-white text-[10px]" />
                    </div>

                    <div className="absolute -bottom-6 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                      {Math.round(signatureArea.width)}×
                      {Math.round(signatureArea.height)}px
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Belum ada dokumen</p>
              </div>
            )}
          </div>

          {clickMode === "signature" && !signatureArea && fileUrl && (
            <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-2">
              <p className="text-sm text-blue-700 text-center font-medium">
                🎯 Klik di dokumen untuk menempatkan QR (70×70px) di Halaman{" "}
                {currentPage}
              </p>
            </div>
          )}

          {signatureArea && (
            <div className="bg-green-50 border-t-2 border-green-200 px-4 py-2">
              <p className="text-xs text-green-700 text-center font-medium flex items-center justify-center gap-2 flex-wrap">
                <span>
                  ✅ {Math.round(signatureArea.width)}×
                  {Math.round(signatureArea.height)}px
                </span>
                <span>•</span>
                <span>Drag pindah • Resize pojok</span>
                <span>•</span>
                <button
                  onClick={() => {
                    setSignatureArea(null);
                    setClickMode("signature");
                  }}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Ulang
                </button>
              </p>
            </div>
          )}
        </div>

        {signatureArea && (
          <div className="w-full max-w-5xl mx-auto mt-4 px-4">
            <button
              onClick={handleTempelTandaTangan}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <FaCheckCircle className="text-xl" />
              <span>Tempel QR di Halaman {currentPage}</span>
            </button>
          </div>
        )}
      </main>

      <style>{`
        .signature-box { 
          transition: all 0.2s;
          border-style: dashed;
        }
        .signature-box:hover { 
          border-color: #2563eb;
          background: rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
