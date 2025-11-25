import React, { useRef, useState } from "react";
import { FaRedoAlt, FaImage, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Ttd() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Mulai menggambar
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX || e.touches?.[0]?.clientX - canvas.offsetLeft,
      e.nativeEvent.offsetY || e.touches?.[0]?.clientY - canvas.offsetTop
    );
  };

  // Proses menggambar
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctx.lineTo(
      e.nativeEvent.offsetX || e.touches?.[0]?.clientX - canvas.offsetLeft,
      e.nativeEvent.offsetY || e.touches?.[0]?.clientY - canvas.offsetTop
    );
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  // Reset canvas
  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUploadedImage(null);
  };

  // Upload gambar tanda tangan
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Simpan dan lanjut
  const handleNext = () => {
    let finalSignature = uploadedImage;

    // Jika pengguna menggambar → ambil dari canvas
    if (!uploadedImage) {
      const canvas = canvasRef.current;
      finalSignature = canvas.toDataURL("image/png");
    }

    localStorage.setItem("signatureImage", finalSignature);
    navigate("/posisi-ttd");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5FAFF]">
      <div className="bg-white w-[360px] rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Tanda Tangan
        </h2>

        {/* AREA CANVAS / PREVIEW */}
        <div className="w-full h-48 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center mb-4 overflow-hidden">
          {!uploadedImage ? (
            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="bg-white rounded-lg cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          ) : (
            <img
              src={uploadedImage}
              alt="Uploaded signature"
              className="object-contain w-full h-full"
            />
          )}
        </div>

        {/* RESET BUTTON */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-700 self-end mb-4 hover:text-red-500 transition"
        >
          <FaRedoAlt /> Reset
        </button>

        {/* BUTTON DRAW / UPLOAD */}
        <div className="flex justify-between w-full mb-5">
          <label className="flex-1 mx-1 py-2 rounded-xl border text-center border-gray-300 cursor-pointer hover:bg-blue-50 transition text-sm font-medium flex items-center justify-center gap-2">
            <FaImage />
            Gambar
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>

          <label className="flex-1 mx-1 py-2 rounded-xl border text-center border-gray-300 cursor-pointer hover:bg-blue-50 transition text-sm font-medium flex items-center justify-center gap-2">
            <FaUpload />
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        {/* NEXT BUTTON */}
        <button
          onClick={handleNext}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB] transition text-white font-semibold py-3 rounded-xl text-base shadow-md"
        >
          Lanjut Pilih Posisi
        </button>
      </div>
    </div>
  );
}
