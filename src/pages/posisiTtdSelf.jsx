import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand, FaQrcode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PosisiTtdSelf() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [signatureData, setSignatureData] = useState(null); // base64 tanda tangan user
  const [signatureArea, setSignatureArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const wrapperRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const [clickMode, setClickMode] = useState("signature");
  const [renderWidth, setRenderWidth] = useState(600);
  const [renderHeight, setRenderHeight] = useState(800);
  const [currentPage] = useState(1); // self sign halaman 1

  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");
    const savedSignature = localStorage.getItem("signatureData");

    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
    if (savedSignature) setSignatureData(savedSignature);
  }, []);

  // Sesuaikan lebar render dengan lebar container
  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setRenderWidth(rect.width - 40);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePageRenderSuccess = (page) => {
    const pageRatio = page.height / page.width;
    setRenderHeight(renderWidth * pageRatio);
  };

  // ================== PILIH AREA ==================

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

    const defaultSize = 80;

    const newArea = {
      x: Math.max(0, clickX - defaultSize / 2),
      y: Math.max(0, clickY - defaultSize / 2),
      width: defaultSize,
      height: defaultSize,
    };

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
    let newSize = Math.max(60, Math.min(140, dragStart.current.width + delta));

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
  };

  const base64ToBlob = (base64String) => {
    const byteString = atob(base64String.split(",")[1]);
    const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // ================== SUBMIT ==================

  const handleTempelTandaTangan = async () => {
    if (!signatureArea) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Area",
        text: "Silakan klik pada dokumen untuk menempatkan tanda tangan",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    if (!signatureData) {
      Swal.fire({
        icon: "warning",
        title: "Belum ada Tanda Tangan",
        text: "Silakan buat atau unggah tanda tangan terlebih dahulu",
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

    const ratioX = signatureArea.x / displayWidth;
    const ratioY = signatureArea.y / displayHeight;
    const avgSize = (signatureArea.width + signatureArea.height) / 2;
    const ratioSize = avgSize / displayWidth;

    Swal.fire({
      title: "Memproses...",
      text: "Sedang menempel tanda tangan...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => Swal.showLoading(),
    });

    try {
      const token = localStorage.getItem("token");
      let uploadedDocId = localStorage.getItem("uploadedDocumentId");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Silakan login kembali",
        });
        navigate("/login");
        return;
      }

      if (!uploadedDocId) {
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
            doc.title === fileName || doc.file_path.includes(fileName)
        );
        if (!targetDoc)
          throw new Error("Dokumen tidak ditemukan di database. Coba upload ulang.");
        uploadedDocId = targetDoc.document_id;
      }

      const blob = base64ToBlob(signatureData);

      const formData = new FormData();
      formData.append("signatureImage", blob, "signature.png");
      formData.append("pageNumber", String(currentPage));
      formData.append("ratioX", String(ratioX));
      formData.append("ratioY", String(ratioY));
      formData.append("ratioSize", String(ratioSize));

      const response = await fetch(
        `${API_BASE_URL}/documents/${uploadedDocId}/sign`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Gagal menempel tanda tangan");
      }

      localStorage.setItem("lastSignedDocument", uploadedDocId);
      clearWorkflowFlags();

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Tanda tangan berhasil ditempel dan terverifikasi.",
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Self-sign error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan sistem",
        confirmButtonColor: "#003E9C",
      });
    }
  };

  // ================== RENDER ==================

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

      <main className="flex-1 flex flex-col p-4 md=p-6">
        <div
          className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <div
            ref={wrapperRef}
            className="relative w-full flex-1 bg-gray-100 overflow-auto"
            onClick={clickMode ? handleClickArea : undefined}
            style={{ minHeight: "500px", cursor: clickMode ? "crosshair" : "default" }}
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
                    <FaQrcode className="text-5xl text-black opacity-40" />

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
                <p className="text-gray-400 text-lg font-medium">
                  Loading dokumen...
                </p>
              </div>
            )}
          </div>

          {clickMode === "signature" && !signatureArea && fileUrl && (
            <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-3">
              <p className="text-sm text-blue-700 text-center font-medium">
                👆 Klik pada dokumen untuk menempatkan tanda tangan
              </p>
            </div>
          )}

          {signatureArea && (
            <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
              <p className="text-sm text-green-700 text-center font-medium">
                ✅ Posisi tanda tangan dipilih • Klik tombol di bawah untuk menempel.
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
    </div>
  );
}
