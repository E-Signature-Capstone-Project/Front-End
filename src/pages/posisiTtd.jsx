import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PosisiTtd() {
  const navigate = useNavigate();

  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  const [signatureUrl, setSignatureUrl] = useState("");
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const previewRef = useRef(null);

  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");
    const savedSignature = localStorage.getItem("signatureImage");

    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
    if (savedSignature) setSignatureUrl(savedSignature);
  }, []);

  // Start dragging
  const startDrag = (e) => {
    setDragging(true);

    const rect = previewRef.current.getBoundingClientRect();

    const mouseX = e.clientX ?? e.touches[0].clientX;
    const mouseY = e.clientY ?? e.touches[0].clientY;

    setOffset({
      x: mouseX - rect.left - position.x,
      y: mouseY - rect.top - position.y,
    });
  };

  // Dragging movement
  const onDrag = (e) => {
    if (!dragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const mouseX = e.clientX ?? e.touches[0].clientX;
    const mouseY = e.clientY ?? e.touches[0].clientY;

    let x = mouseX - rect.left - offset.x;
    let y = mouseY - rect.top - offset.y;

    const maxX = rect.width - 120;
    const maxY = rect.height - 60;

    setPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    });
  };

  const stopDrag = () => {
    setDragging(false);
  };

  const handleTempel = () => {
    const finalData = {
      x: position.x,
      y: position.y,
      signature: signatureUrl,
    };

    localStorage.setItem("ttdPosition", JSON.stringify(finalData));

    alert("Tanda tangan berhasil ditempel pada posisi yang diinginkan! ✅");
  };

  return (
    <div
      className="min-h-screen bg-[#EEF3FA] flex flex-col items-center"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onTouchMove={onDrag}
      onTouchEnd={stopDrag}
    >
      <header className="w-full bg-white border-b shadow-sm py-4 px-10 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft size={18} />
        </button>

        <h1 className="ml-6 text-xl font-semibold text-gray-800">
          Posisi Tanda Tangan
        </h1>
      </header>

      <main className="flex flex-col items-center justify-center w-full flex-1 p-10">
        <div className="w-[65%] bg-white border shadow-md rounded-xl flex flex-col items-center p-6">

          <p className="text-sm font-medium text-gray-700 mb-3">
            Preview Dokumen {fileName && `(${fileName})`}
          </p>

          <div
            ref={previewRef}
            className="relative w-full h-[80vh] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50"
          >
            {fileUrl ? (
              <>
                {/* PDF */}
                {fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={fileUrl}
                    title="Preview PDF"
                    className="w-full h-full border-none"
                  ></iframe>
                ) : (
                  <img
                    src={fileUrl}
                    alt="Preview Dokumen"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* DRAGGABLE SIGNATURE */}
                {signatureUrl && (
                  <img
                    src={signatureUrl}
                    alt="TTD"
                    className="absolute cursor-move w-32 opacity-90"
                    onMouseDown={startDrag}
                    onTouchStart={startDrag}
                    style={{
                      top: position.y,
                      left: position.x,
                    }}
                  />
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                Belum ada dokumen yang diunggah.
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Geser tanda tangan ke posisi yang kamu inginkan.
          </p>

          <button
            onClick={handleTempel}
            className="bg-blue-700 text-white mt-6 px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Tempel Tanda Tangan
          </button>
        </div>
      </main>
    </div>
  );
}
