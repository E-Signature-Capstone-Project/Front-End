import React, { useRef, useState, useEffect } from "react";
import { FaUndo, FaUpload } from "react-icons/fa";

export default function SignatureForm({ onChange, onConfirm }) {
  const canvasRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    if (e.type === "mousedown") {
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    } else if (e.type === "touchstart") {
      e.preventDefault();
      const touch = e.touches[0];
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    if (e.type === "mousemove") {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    } else if (e.type === "touchmove") {
      e.preventDefault();
      const touch = e.touches[0];
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      ctx.stroke();
    }

    if (onChange) onChange(canvas.toDataURL("image/png"));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUploadedImage(null);
    if (onChange) onChange(null);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Hitung proporsi untuk fit canvas
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        setUploadedImage(event.target.result);
        if (onChange) onChange(canvas.toDataURL("image/png"));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let isEmpty = true;
    
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] !== 0) {
        isEmpty = false;
        break;
      }
    }
    
    if (isEmpty) {
      alert('Tanda tangan kosong. Silakan gambar atau upload tanda tangan terlebih dahulu');
      return;
    }
    
    const signatureData = canvas.toDataURL("image/png");
    if (onConfirm) onConfirm(signatureData);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Canvas Area */}
      <div className="w-full mb-5">
        <div className="border-2 border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            className="w-full cursor-crosshair touch-none bg-white"
            style={{ touchAction: "none", display: "block" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-500 text-blue-500 font-semibold hover:bg-blue-50 transition"
        >
          <FaUndo className="text-sm" />
          <span>Reset</span>
        </button>

        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-500 text-blue-500 font-semibold hover:bg-blue-50 cursor-pointer transition">
          <FaUpload className="text-sm" />
          <span>Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition shadow-md"
      >
        Lanjut Pilih Posisi
      </button>
    </div>
  );
}