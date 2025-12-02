import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheckCircle, FaExpand, FaQrcode } from "react-icons/fa";
import SignatureForm from "../components/SignatureForm"; // sesuaikan path
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PosisiTtd() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [signatureData, setSignatureData] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureArea, setSignatureArea] = useState(null);
  const [qrArea, setQrArea] = useState(null);
  const [forceExternalBaseline, setForceExternalBaseline] = useState(false);

  const [activeArea, setActiveArea] = useState(null); // 'signature' atau 'qr'
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const [clickMode, setClickMode] = useState("signature"); // 'signature', 'qr', atau null

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
    if (e.target.closest(".signature-box") || e.target.closest(".qr-box"))
      return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    const defaultWidth = clickMode === "signature" ? 150 : 80;
    const defaultHeight = clickMode === "signature" ? 75 : 80;

    const newArea = {
      x: Math.max(0, x - defaultWidth / 2),
      y: Math.max(0, y - defaultHeight / 2),
      width: defaultWidth,
      height: defaultHeight,
    };

    if (clickMode === "signature") {
      setSignatureArea(newArea);
      setClickMode("qr");
    } else if (clickMode === "qr") {
      setQrArea(newArea);
      setClickMode(null);
    }
  };

  const handleMouseDown = (type) => (e) => {
    const area = type === "signature" ? signatureArea : qrArea;
    if (!area) return;
    e.stopPropagation();
    setIsDragging(true);
    setActiveArea(type);

    const rect = containerRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left + containerRef.current.scrollLeft - area.x,
      y: e.clientY - rect.top + containerRef.current.scrollTop - area.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !activeArea || !containerRef.current) return;

    const area = activeArea === "signature" ? signatureArea : qrArea;
    const setArea = activeArea === "signature" ? setSignatureArea : setQrArea;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    const newX = e.clientX - rect.left + scrollLeft - dragStart.current.x;
    const newY = e.clientY - rect.top + scrollTop - dragStart.current.y;

    const maxX = containerRef.current.scrollWidth - area.width;
    const maxY = containerRef.current.scrollHeight - area.height;

    setArea({
      ...area,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveArea(null);
  };

  const handleResizeMouseDown = (type) => (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveArea(type);
    const area = type === "signature" ? signatureArea : qrArea;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: area.width,
      height: area.height,
    };
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing || !activeArea) return;

    const area = activeArea === "signature" ? signatureArea : qrArea;
    const setArea = activeArea === "signature" ? setSignatureArea : setQrArea;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    let newWidth = Math.max(60, dragStart.current.width + deltaX);
    let newHeight = Math.max(60, dragStart.current.height + deltaY);

    if (activeArea === "qr") {
      const side = Math.max(newWidth, newHeight);
      newWidth = side;
      newHeight = side;
    }

    setArea({
      ...area,
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
  }, [isDragging, isResizing, activeArea, signatureArea, qrArea]);

  const clearWorkflowFlags = () => {
    localStorage.removeItem("uploadedFileUrl");
    localStorage.removeItem("uploadedFileName");
    localStorage.removeItem("signatureData");
    localStorage.removeItem("uploadedDocumentId");
    localStorage.removeItem("isRequestedDocument");
    localStorage.removeItem("requestId");
    localStorage.removeItem("requesterName");
    localStorage.removeItem("selectedBaselineId");
  };

  const isOverlap = (a, b) => {
    if (!a || !b) return false;
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  };

  const handleTempelTandaTangan = async () => {
    if (!signatureArea || !qrArea) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Area Lengkap",
        text: "Silakan pilih area untuk TTD dan QR Code",
        confirmButtonColor: "#003E9C",
      });
      return;
    }

    if (isOverlap(signatureArea, qrArea)) {
      Swal.fire({
        icon: "warning",
        title: "Posisi Tidak Valid",
        text: "QR Code tidak boleh menutupi area tanda tangan. Silakan geser atau resize.",
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

      const iframeRect = iframeRef.current?.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const displayWidth = iframeRect ? iframeRect.width : containerRect.width;
      const displayHeight = iframeRect
        ? iframeRect.height
        : containerRect.height;

      const scaleX = PDF_WIDTH_POINTS / displayWidth;
      const scaleY = PDF_HEIGHT_POINTS / displayHeight;

      const pdfSigX = signatureArea.x * scaleX;
      const pdfSigY =
        (displayHeight - signatureArea.y - signatureArea.height) * scaleY;
      const pdfSigWidth = signatureArea.width * scaleX;
      const pdfSigHeight = signatureArea.height * scaleY;

      const pdfQrX = qrArea.x * scaleX;
      const pdfQrY =
        (displayHeight - qrArea.y - qrArea.height) * scaleY;
      const pdfQrWidth = qrArea.width * scaleX;
      const pdfQrHeight = qrArea.height * scaleY;

      const isExternalSign =
            (isRequestedDoc === "true" && requestId) || forceExternalBaseline;
      const signEndpoint = isExternalSign
        ? `${API_BASE_URL}/documents/${documentId}/sign/external`
        : `${API_BASE_URL}/documents/${documentId}/sign`;

      let response;

      if (isExternalSign) {
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

          if (!baselineResponse.ok) {
            throw new Error(
              "Tidak dapat mengambil data baseline. Pastikan Anda sudah membuat baseline signature."
            );
          }

          const baselinesData = await baselineResponse.json();
          const baselines = Array.isArray(baselinesData)
            ? baselinesData
            : baselinesData.baselines || [];

          if (!baselines || baselines.length === 0) {
            throw new Error(
              "Anda belum memiliki baseline signature. Silakan buat baseline terlebih dahulu di menu Baseline Sign."
            );
          }

          baseline_id = baselines[0].baseline_id;
          localStorage.setItem("selectedBaselineId", baseline_id);
        }

        response = await fetch(signEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            baseline_id: baseline_id,
            pageNumber: 1,
            x: Math.round(pdfSigX),
            y: Math.round(pdfSigY),
            width: Math.round(pdfSigWidth),
            height: Math.round(pdfSigHeight),
            qr_x: Math.round(pdfQrX),
            qr_y: Math.round(pdfQrY),
            qr_width: Math.round(pdfQrWidth),
            qr_height: Math.round(pdfQrHeight),
          }),
        });
      } else {
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
            } else {
              throw new Error("Format data URL tidak valid");
            }
          } else {
            base64Data = signatureData;
          }

          base64Data = base64Data
            .trim()
            .replace(/\s+/g, "")
            .replace(/[^A-Za-z0-9+/=]/g, "");

          const paddingNeeded = (4 - (base64Data.length % 4)) % 4;
          if (paddingNeeded > 0) {
            base64Data += "=".repeat(paddingNeeded);
          }

          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        } catch (decodeError) {
          throw new Error(
            "Gagal decode tanda tangan: " + decodeError.message
          );
        }

        const formData = new FormData();
        formData.append("signatureImage", blob, "signature.png");
        formData.append("pageNumber", "1");
        formData.append("x", String(Math.round(pdfSigX)));
        formData.append("y", String(Math.round(pdfSigY)));
        formData.append("width", String(Math.round(pdfSigWidth)));
        formData.append("height", String(Math.round(pdfSigHeight)));
        formData.append("qr_x", String(Math.round(pdfQrX)));
        formData.append("qr_y", String(Math.round(pdfQrY)));
        formData.append("qr_width", String(Math.round(pdfQrWidth)));
        formData.append("qr_height", String(Math.round(pdfQrHeight)));

        response = await fetch(signEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      const result = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          result.error &&
          (result.error.includes("tidak cocok") ||
            result.error.includes("tidak sesuai") ||
            result.error.includes("verifikasi gagal"))
        ) {
          Swal.close();

          const swalResult = await Swal.fire({
            icon: "error",
            title: "Tanda Tangan Tidak Cocok",
            html: `
              <p class="text-gray-700 mb-4">${result.error}</p>
              <p class="text-sm text-gray-600">Silakan pilih tindakan yang ingin dilakukan:</p>
            `,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "🖊️ Gambar Ulang",
            denyButtonText: "📋 Ambil dari Baseline",
            confirmButtonColor: "#003E9C",
            denyButtonColor: "#10B981",
            cancelButtonColor: "#6B7280",
          });

          // 🖊️ Gambar ulang
          if (swalResult.isConfirmed) {
            localStorage.removeItem("signatureData");
            setSignatureData(null);

            await Swal.fire({
              icon: "info",
              title: "Gambar ulang tanda tangan",
              text: "Silakan buat tanda tangan baru.",
              confirmButtonColor: "#003E9C",
            });

            setShowSignatureModal(true);
          }
          // 📋 Ambil dari Baseline
          else if (swalResult.isDenied) {
            try {
              const baselineToken = localStorage.getItem("token");
              const baselineResponse = await fetch(
                `${API_BASE_URL}/signature_baseline/`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${baselineToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!baselineResponse.ok) {
                throw new Error("Gagal mengambil baseline signature.");
              }

              const baselinesData = await baselineResponse.json();
              const baselines = Array.isArray(baselinesData)
                ? baselinesData
                : baselinesData.baselines || [];

              if (!baselines || baselines.length === 0) {
                throw new Error(
                  "Anda belum memiliki baseline signature. Silakan buat baseline terlebih dahulu."
                );
              }

              const firstBaselineId = baselines[0].baseline_id;
              localStorage.setItem("selectedBaselineId", firstBaselineId);
              setForceExternalBaseline(true); // ⬅️ paksa pakai endpoint external

              await Swal.fire({
                icon: "success",
                title: "Baseline Dipilih",
                text:
                  "Baseline signature berhasil dipilih. Silakan tentukan ulang posisi TTD & QR lalu tempel kembali.",
                confirmButtonColor: "#003E9C",
              });

              setSignatureArea(null);
              setQrArea(null);
              setClickMode("signature");
            } catch (e) {
              await Swal.fire({
                icon: "error",
                title: "Gagal",
                text: e.message || "Tidak dapat mengambil baseline.",
                confirmButtonColor: "#003E9C",
              });
            }
          }

          return;
        }

        throw new Error(
          result.error || result.message || "Gagal menandatangani dokumen"
        );
      }

      localStorage.setItem("lastSignedDocument", documentId);
      clearWorkflowFlags();

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: result.message || "Dokumen berhasil ditandatangani",
        confirmButtonColor: "#003E9C",
      });

      navigate("/dashboard");
    } catch (error) {
      clearWorkflowFlags();

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error.message || "Terjadi kesalahan saat menandatangani dokumen",
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
        Pilih Posisi TTD & QR - {fileName}
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

              {signatureArea && signatureData && (
                <div
                  className="signature-box absolute border-3 border-blue-500 rounded-lg shadow-2xl cursor-move overflow-hidden"
                  style={{
                    left: `${signatureArea.x}px`,
                    top: `${signatureArea.y}px`,
                    width: `${signatureArea.width}px`,
                    height: `${signatureArea.height}px`,
                    zIndex: 30,
                    backgroundImage: `url(${signatureData})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    pointerEvents: "auto",
                  }}
                  onMouseDown={handleMouseDown("signature")}
                >
                  <div
                    className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-tl-lg cursor-nwse-resize flex items-center justify-center hover:bg-blue-600 transition"
                    onMouseDown={handleResizeMouseDown("signature")}
                  >
                    <FaExpand className="text-white text-xs" />
                  </div>

                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center pointer-events-none shadow-lg">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>

                  <div className="absolute -bottom-7 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                    TTD • {Math.round(signatureArea.width)} ×{" "}
                    {Math.round(signatureArea.height)} px
                  </div>
                </div>
              )}

              {qrArea && (
                <div
                  className="qr-box absolute border-3 border-green-500 rounded-lg shadow-2xl cursor-move overflow-hidden bg-white bg-opacity-90"
                  style={{
                    left: `${qrArea.x}px`,
                    top: `${qrArea.y}px`,
                    width: `${qrArea.width}px`,
                    height: `${qrArea.height}px`,
                    zIndex: 30,
                    pointerEvents: "auto",
                  }}
                  onMouseDown={handleMouseDown("qr")}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <FaQrcode className="text-gray-400 text-4xl" />
                  </div>

                  <div
                    className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-tl-lg cursor-nwse-resize flex items-center justify-center hover:bg-green-600 transition"
                    onMouseDown={handleResizeMouseDown("qr")}
                  >
                    <FaExpand className="text-white text-xs" />
                  </div>

                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center pointer-events-none shadow-lg">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>

                  <div className="absolute -bottom-7 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                    QR • {Math.round(qrArea.width)} ×{" "}
                    {Math.round(qrArea.height)} px
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
              👆 <strong>Langkah 1/2:</strong> Klik pada dokumen untuk
              menempatkan <strong>Tanda Tangan</strong>
            </p>
          </div>
        )}

        {clickMode === "qr" && signatureArea && !qrArea && fileUrl && (
          <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
            <p className="text-sm text-green-700 text-center font-medium">
              👆 <strong>Langkah 2/2:</strong> Klik pada dokumen untuk
              menempatkan <strong>QR Code</strong>
            </p>
          </div>
        )}

        {signatureArea && qrArea && (
          <div className="bg-green-50 border-t-2 border-green-200 px-4 py-3">
            <p className="text-sm text-green-700 text-center font-medium">
              ✅ Posisi sudah dipilih • Drag untuk pindah • Resize di pojok
              kanan bawah •
              <button
                onClick={() => {
                  setSignatureArea(null);
                  setQrArea(null);
                  setClickMode("signature");
                }}
                className="ml-2 text-blue-600 underline hover:text-blue-800"
              >
                Pilih Ulang
              </button>
            </p>
          </div>
        )}

        {signatureArea && qrArea && isOverlap(signatureArea, qrArea) && (
          <div className="bg-yellow-50 border-t-2 border-yellow-200 px-4 py-3">
            <p className="text-sm text-yellow-700 text-center font-medium">
              ⚠️ QR Code menutupi area tanda tangan. Geser atau perkecil QR
              sebelum menempel.
            </p>
          </div>
        )}
      </div>

      {signatureArea && qrArea && (
        <div className="w-full max-w-5xl mx-auto mt-6 px-4 animate-slide-up">
          <button
            onClick={handleTempelTandaTangan}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <FaCheckCircle className="text-2xl" />
            <span>Tempel TTD & QR di Posisi Ini</span>
          </button>
        </div>
      )}

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl relative shadow-2xl">
            <button
              onClick={() => setShowSignatureModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-center mb-4">
              Tanda Tangan
            </h2>

            <SignatureForm
              onConfirm={(data) => {
                localStorage.setItem("signatureData", data);
                setSignatureData(data);
                setShowSignatureModal(false);
              }}
            />
          </div>
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

      .signature-box,
      .qr-box {
        transition: box-shadow 0.2s ease;
      }

      .signature-box:hover {
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
      }

      .qr-box:hover {
        box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
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
