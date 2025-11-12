import React, { useRef, useState } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaExchangeAlt,
  FaPaintBrush,
  FaUpload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const canvasRef = useRef(null);

  const [signatures, setSignatures] = useState([]);
  const [replaceId, setReplaceId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleBack = () => navigate("/dashboard"); 
  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) navigate("/login"); 
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (signatures.length >= 5) return alert("Maksimal 5 signature!");

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatures((prev) => [...prev, { id: prev.length + 1, src: event.target.result }]);
      setShowOptions(false);
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceUpload = (e) => {
    const file = e.target.files[0];
    if (!file || replaceId === null) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatures((prev) =>
        prev.map((sig) => (sig.id === replaceId ? { ...sig, src: event.target.result } : sig))
      );
      setReplaceId(null);
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#003E9C"; // ganti warna garis jadi biru
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleSaveDrawing = () => {
    if (signatures.length >= 5) return alert("Maksimal 5 signature!");
    setSignatures((prev) => [...prev, { id: prev.length + 1, src: canvasRef.current.toDataURL("image/png") }]);
    setIsDrawingMode(false);
  };

  const handleClearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex font-sans">

      {/* LEFT PROFILE PANEL */}
      <div className="w-[260px] bg-white h-screen shadow-md border-r border-gray-200 p-6 flex flex-col items-center sticky top-0">
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="h-14 w-14 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.67 0 8 1.34 8 4v4H4v-4c0-2.66 5.33-4 8-4z" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold">Ardian</h2>
        <p className="text-gray-500 text-sm mb-8">ardian@gmail.com</p>

        <button
          onClick={handleBack}
          className="w-full mb-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <FaArrowLeft />
          Back
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-[#003E9C] hover:bg-[#002A6B] text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <FaExchangeAlt />
          Log out
        </button>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-semibold mb-6">Signature Baseline</h1>

        <div className="bg-white p-6 shadow rounded-xl border border-gray-200">

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className="relative aspect-square w-40 border rounded-lg shadow-sm bg-gray-50 flex items-center justify-center"
              >
                <img src={sig.src} alt="" className="max-w-full max-h-full object-contain p-2" />
                <button
                  onClick={() => {
                    setReplaceId(sig.id);
                    replaceInputRef.current.click();
                  }}
                  className="absolute top-2 right-2 bg-white border p-1 rounded-full shadow hover:bg-gray-100"
                >
                  <FaExchangeAlt size={14} className="text-[#003E9C]" />
                </button>
              </div>
            ))}

            {/* ADD BUTTON */}
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="aspect-square w-40 border border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <FaPlus className="text-[#003E9C] mb-1" />
              Tambah
            </button>
          </div>

          {showOptions && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-2 border rounded-md flex items-center gap-2 text-sm"
              >
                <FaUpload className="text-[#003E9C]" /> Upload
              </button>

              <button
                onClick={() => { setIsDrawingMode(true); setShowOptions(false); }}
                className="px-3 py-2 border rounded-md flex items-center gap-2 text-sm"
              >
                <FaPaintBrush className="text-[#003E9C]" /> Draw
              </button>
            </div>
          )}

          {isDrawingMode && (
            <div className="flex flex-col items-center border p-4 rounded-md">
              <canvas
                ref={canvasRef}
                width={550}
                height={230}
                className="border rounded-md bg-gray-50 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex gap-2 mt-4">
                <button onClick={handleClearCanvas} className="px-4 py-2 bg-gray-200 rounded-md">Clear</button>
                <button onClick={handleSaveDrawing} className="px-4 py-2 bg-[#003E9C] text-white rounded-md">Save</button>
                <button onClick={() => setIsDrawingMode(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-6">Maksimal 5 signature.</p>
        </div>
      </div>

      {/* Hidden Inputs */}
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      <input type="file" accept="image/*" ref={replaceInputRef} onChange={handleReplaceUpload} className="hidden" />
    </div>
  );
}
