import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFilePdf } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

export default function SignatureOptions() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  if (!data) return <p className="p-8">Data tidak ditemukan.</p>;

  const goToDraw = () => navigate("/drawsignature", { state: data });
  const goToUpload = () => navigate("/uploadsignature", { state: data });

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">

      {/* SIDEBAR — Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 md:ml-64">

        {/* HEADER */}
        <Header notificationCount={2} />

        {/* PAGE CONTENT */}
        <div className="w-full p-6 flex justify-center">

          <div className="w-full max-w-4xl">

            {/* Breadcrumb */}
            <p className="text-sm text-gray-500 mb-6 mt-2">
              Notification List &gt;{" "}
              <span
                className="cursor-pointer text-[#007BFF] hover:underline"
                onClick={() => navigate("/signaturerequest", { state: data })}
              >
                Signature Request
              </span>{" "}
              &gt;{" "}
              <span className="font-semibold text-gray-800">
                Signature Options
              </span>
            </p>

            {/* CARD */}
            <div className="w-full bg-white rounded-xl p-10 min-h-[500px] flex flex-col items-center shadow-lg border border-gray-200">

              {/* PDF PREVIEW */}
              <div className="w-full max-w-lg h-64 bg-[#F5F7FA] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center mb-10 hover:bg-[#E6F0FF] hover:border-[#7CA9FF] transition-all">
                
                <FaFilePdf className="text-red-600 text-6xl mb-3" />
                
                <span className="font-semibold text-lg text-gray-800">
                  {data.fileName || "Surat Tugas.pdf"}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <button
                  onClick={goToDraw}
                  className="w-44 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition active:scale-95"
                >
                  Draw Signature
                </button>

                <button
                  onClick={goToUpload}
                  className="w-44 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition active:scale-95"
                >
                  Upload Signature
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
