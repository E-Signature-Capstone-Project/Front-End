import React, { useRef, useState } from "react";

const DrawSignature = () => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [ctx, setCtx] = useState(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    setCtx(context);

    context.strokeStyle = "#000";
    context.lineWidth = 2;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");

    console.log("Signature Saved:", dataURL);
    alert("Signature saved!");

    // Nanti bisa POST ke backend:
    // await axios.post("/api/upload-signature", { file: dataURL });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-500 mb-4">
        Notification List &gt; Signature Request &gt; <span className="font-semibold">Draw Signature</span>
      </p>

      {/* Card */}
      <div className="w-full border rounded-xl bg-gray-50 p-8 flex flex-col items-center">
        {/* Canvas Box */}
        <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg">
          <canvas
            ref={canvasRef}
            width={350}
            height={250}
            className="cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <p className="text-gray-500 mt-3">Please Draw Your Signature</p>

        {/* Button */}
        <button
          onClick={handleSave}
          className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          Save Sign
        </button>
      </div>
    </div>
  );
};

export default DrawSignature;
