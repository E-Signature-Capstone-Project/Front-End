import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

export default function DrawSignature() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousData = location.state || {};

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.lineWidth = 3;
    context.lineCap = "round";
    context.strokeStyle = "#000";
    setCtx(context);
  }, []);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    ctx.beginPath();
  };

  const handleSave = () => {
    const dataURL = canvasRef.current.toDataURL("image/png");

    navigate("/signaturesend", {
      state: {
        ...previousData,
        signatureImage: dataURL,
      },
    });
  };

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">

      {/* SIDEBAR — hidden in mobile */}
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 md:ml-64">

        <Header notificationCount={2} />

        <div className="w-full p-6 flex justify-center">
          <div className="w-full max-w-4xl">

            {/* BREADCRUMB */}
            <p className="text-sm text-gray-500 mb-6 mt-2">
              Notification List &gt;{" "}
              <span
                className="cursor-pointer text-[#007BFF] hover:underline"
                onClick={() =>
                  navigate("/signaturesend", { state: previousData })
                }
              >
                Signature Request
              </span>{" "}
              &gt;{" "}
              <span className="font-semibold text-gray-800">Draw Signature</span>
            </p>

            {/* CARD */}
            <div className="w-full bg-white rounded-xl p-10 min-h-[500px] flex flex-col items-center shadow-lg border border-gray-200">

              {/* DRAW BOX */}
              <div className="relative w-full max-w-lg h-[350px] bg-[#F5F7FA] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden mb-8">

                <p className="absolute text-2xl font-semibold text-gray-300 pointer-events-none select-none z-0 text-center">
                   <br /> 
                </p>

                <canvas
                  ref={canvasRef}
                  width={500}
                  height={350}
                  className="absolute inset-0 z-10 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />

                <div className="absolute bottom-4 z-20">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-white text-gray-800 font-semibold rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition active:scale-95"
                  >
                    Save Signature
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                  )
                }
                className="text-gray-500 text-sm hover:text-red-600 underline"
              >
                Clear Canvas
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
